import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { ScormParser, type ScormCourse } from './scorm-parser';
import { storage } from './storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ScormIntegration {
  private scormCoursesPath: string;
  private scormParser: ScormParser;

  constructor() {
    this.scormCoursesPath = path.join(__dirname, 'public', 'scorm-courses');
    // Get list of SCORM course directories and sort them
    const courseDirs = fs.readdirSync(this.scormCoursesPath)
      .filter(dir => fs.statSync(path.join(this.scormCoursesPath, dir)).isDirectory())
      .sort((a, b) => {
        // Extract course numbers and sort numerically
        const numA = parseInt(a.match(/micro-course-(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/micro-course-(\d+)/)?.[1] || '0');
        return numA - numB;
      });
    this.scormParser = new ScormParser(this.scormCoursesPath);
  }

  async initializeScormCourses(): Promise<void> {
    console.log('Initializing SCORM courses...');
    
    try {
      const scormCourses = await this.scormParser.parseAllCourses();
      
      for (const scormCourse of scormCourses) {
        await this.integrateScormCourse(scormCourse);
      }
      
      console.log(`Successfully integrated ${scormCourses.length} SCORM courses`);
    } catch (error) {
      console.error('Error initializing SCORM courses:', error);
      throw error;
    }
  }

  private async integrateScormCourse(scormCourse: ScormCourse): Promise<void> {
    try {
      // Check if course already exists
      const existingCourse = await storage.getCourse(scormCourse.id);
      
      if (existingCourse) {
        console.log(`SCORM course ${scormCourse.title} already exists, updating...`);
        await this.updateExistingCourse(existingCourse.id, scormCourse);
      } else {
        console.log(`Creating new SCORM course: ${scormCourse.title}`);
        await this.createNewCourse(scormCourse);
      }
    } catch (error) {
      console.error(`Error integrating SCORM course ${scormCourse.title}:`, error);
    }
  }

  private async createNewCourse(scormCourse: ScormCourse): Promise<void> {
    // Create the course
    const course = await storage.createCourse({
      id: scormCourse.id,
      title: scormCourse.title,
      description: scormCourse.description,
      instructorId: 'system', // System-generated course
      categoryId: 'scorm-courses', // Default category for SCORM courses
      imageUrl: this.getCourseThumbnail(scormCourse),
      isPublished: true
    });

    // Create a single module for the SCORM content
    const module = await storage.createModule({
      id: `${scormCourse.id}-module-1`,
      courseId: course.id,
      title: scormCourse.title,
      description: 'Interactive SCORM content',
      orderIndex: 1
    });

    // Create a lesson that launches the SCORM content
    await storage.createLesson({
      id: `${scormCourse.id}-lesson-1`,
      moduleId: module.id,
      title: scormCourse.title,
      content: this.generateScormLessonContent(scormCourse),
      videoUrl: null,
      orderIndex: 1,
      duration: null // SCORM courses don't have predefined duration
    });
  }

  private async updateExistingCourse(courseId: string, scormCourse: ScormCourse): Promise<void> {
    // Update course metadata
    await storage.updateCourse(courseId, {
      title: scormCourse.title,
      description: scormCourse.description,
      imageUrl: this.getCourseThumbnail(scormCourse),
      isPublished: true
    });

    // Get existing modules and lessons to update content
    const modules = await storage.getModulesByCourse(courseId);
    if (modules.length > 0) {
      const lessons = await storage.getLessonsByModule(modules[0].id);
      if (lessons.length > 0) {
        await storage.updateLesson(lessons[0].id, {
          title: scormCourse.title,
          content: this.generateScormLessonContent(scormCourse)
        });
      }
    }
  }

  private generateScormLessonContent(scormCourse: ScormCourse): string {
    return `
      <div class="scorm-lesson-container">
        <div class="scorm-info">
          <h3>Interactive Learning Module</h3>
          <p>${scormCourse.description}</p>
          <p><strong>Version:</strong> ${scormCourse.version}</p>
        </div>
        
        <div class="scorm-launch-section">
          <button 
            class="scorm-launch-btn" 
            onclick="launchScormContent('${scormCourse.launchUrl}', '${scormCourse.id}')"
          >
            Launch Interactive Content
          </button>
        </div>

        <div id="scorm-player-${scormCourse.id}" class="scorm-player-container" style="display: none;">
          <div class="scorm-player-header">
            <h4>${scormCourse.title}</h4>
            <button onclick="closeScormPlayer('${scormCourse.id}')">Close</button>
          </div>
          <iframe 
            id="scorm-iframe-${scormCourse.id}"
            src=""
            width="100%" 
            height="600px"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <style>
        .scorm-lesson-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .scorm-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .scorm-launch-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .scorm-launch-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .scorm-launch-btn:hover {
          background: #0056b3;
        }
        
        .scorm-player-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 20px;
        }
        
        .scorm-player-header {
          background: #343a40;
          color: white;
          padding: 10px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .scorm-player-header button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
      </style>

      <script>
        function launchScormContent(launchUrl, courseId) {
          const playerContainer = document.getElementById('scorm-player-' + courseId);
          const iframe = document.getElementById('scorm-iframe-' + courseId);
          
          // Set the iframe source and show the player
          iframe.src = launchUrl;
          playerContainer.style.display = 'block';
          
          // Scroll to the player
          playerContainer.scrollIntoView({ behavior: 'smooth' });
          
          // Track course launch
          fetch('/api/scorm/launch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              courseId: courseId,
              launchUrl: launchUrl
            })
          });
        }
        
        function closeScormPlayer(courseId) {
          const playerContainer = document.getElementById('scorm-player-' + courseId);
          const iframe = document.getElementById('scorm-iframe-' + courseId);
          
          // Hide the player and clear iframe
          playerContainer.style.display = 'none';
          iframe.src = '';
          
          // Track course close
          fetch('/api/scorm/close', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              courseId: courseId
            })
          });
        }
      </script>
    `;
  }

  private getCourseThumbnail(scormCourse: ScormCourse): string {
    // Try to find a thumbnail in the course assets
    const commonThumbnails = [
      'thumbnail.jpg', 'thumbnail.png', 'cover.jpg', 'cover.png',
      'assets/thumbnail.jpg', 'assets/cover.jpg', 'scormcontent/assets/cover.jpg'
    ];
    
    // For now, return a default thumbnail URL
    // In a real implementation, you'd check if these files exist
    return `/scorm-courses/${scormCourse.id}/thumbnail.jpg`;
  }

  async getScormCoursesList(): Promise<ScormCourse[]> {
    return await this.scormParser.parseAllCourses();
  }
}
