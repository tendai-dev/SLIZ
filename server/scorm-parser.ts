import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ScormCourse {
  id: string;
  title: string;
  description: string;
  version: string;
  launchUrl: string;
  manifestPath: string;
  contentPath: string;
}

export class ScormParser {
  private scormCoursesPath: string;

  constructor(scormCoursesPath: string) {
    this.scormCoursesPath = scormCoursesPath;
  }

  async parseAllCourses(): Promise<ScormCourse[]> {
    const courses: ScormCourse[] = [];
    
    try {
      const courseDirectories = fs.readdirSync(this.scormCoursesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const courseDir of courseDirectories) {
        if (courseDir.startsWith('.')) continue; // Skip hidden directories
        
        try {
          const course = await this.parseCourse(courseDir);
          if (course) {
            courses.push(course);
          }
        } catch (error) {
          console.error(`Error parsing course ${courseDir}:`, error);
        }
      }
    } catch (error) {
      console.error('Error reading SCORM courses directory:', error);
    }

    return courses;
  }

  private async parseCourse(courseDir: string): Promise<ScormCourse | null> {
    const coursePath = path.join(this.scormCoursesPath, courseDir);
    const manifestPath = path.join(coursePath, 'imsmanifest.xml');
    
    if (!fs.existsSync(manifestPath)) {
      console.warn(`No imsmanifest.xml found in ${courseDir}`);
      return null;
    }

    try {
      const manifestXml = fs.readFileSync(manifestPath, 'utf8');
      const parser = new xml2js.Parser();
      const manifest = await parser.parseStringPromise(manifestXml);

      // Extract course information from manifest
      const manifestRoot = manifest.manifest;
      const organizations = manifestRoot.organizations?.[0];
      const defaultOrg = organizations?.organization?.[0];
      const resources = manifestRoot.resources?.[0];
      
      if (!defaultOrg || !resources) {
        console.warn(`Invalid manifest structure in ${courseDir}`);
        return null;
      }

      // Get course title
      const title = this.extractTitle(defaultOrg, courseDir);
      
      // Get launch URL from resources
      const launchUrl = this.extractLaunchUrl(resources, courseDir);
      
      // Extract description from metadata if available
      const description = await this.extractDescription(coursePath);

      return {
        id: this.generateCourseId(courseDir),
        title,
        description,
        version: manifestRoot.$.version || '1.0',
        launchUrl,
        manifestPath,
        contentPath: coursePath
      };
    } catch (error) {
      console.error(`Error parsing manifest for ${courseDir}:`, error);
      return null;
    }
  }

  private extractTitle(organization: any, fallbackDir: string): string {
    // Try to get title from organization
    if (organization.title?.[0]) {
      if (typeof organization.title[0] === 'string') {
        return organization.title[0];
      } else if (organization.title[0]._) {
        return organization.title[0]._;
      }
    }

    // Try to get from first item
    if (organization.item?.[0]?.title?.[0]) {
      const itemTitle = organization.item[0].title[0];
      if (typeof itemTitle === 'string') {
        return itemTitle;
      } else if (itemTitle._) {
        return itemTitle._;
      }
    }

    // Fallback to formatted directory name
    return this.formatDirectoryName(fallbackDir);
  }

  private extractLaunchUrl(resources: any, courseDir: string): string {
    const resource = resources.resource?.[0];
    if (resource?.$.href) {
      return `/scorm-courses/${courseDir}/${resource.$.href}`;
    }
    
    // Fallback to common SCORM entry points
    const commonEntryPoints = ['index.html', 'scormdriver/indexAPI.html', 'launch.html'];
    for (const entryPoint of commonEntryPoints) {
      const fullPath = path.join(this.scormCoursesPath, courseDir, entryPoint);
      if (fs.existsSync(fullPath)) {
        return `/scorm-courses/${courseDir}/${entryPoint}`;
      }
    }
    
    return `/scorm-courses/${courseDir}/index.html`;
  }

  private async extractDescription(coursePath: string): Promise<string> {
    const metadataPath = path.join(coursePath, 'metadata.xml');
    
    if (!fs.existsSync(metadataPath)) {
      return 'SCORM course content';
    }

    try {
      const metadataXml = fs.readFileSync(metadataPath, 'utf8');
      const parser = new xml2js.Parser();
      const metadata = await parser.parseStringPromise(metadataXml);
      
      // Try to extract description from LOM metadata
      const general = metadata.lom?.general?.[0];
      if (general?.description?.[0]?.langstring?.[0]) {
        const desc = general.description[0].langstring[0];
        if (typeof desc === 'string' && desc !== 'Description') {
          return desc;
        } else if (desc._ && desc._ !== 'Description') {
          return desc._;
        }
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    return 'SCORM course content';
  }

  private generateCourseId(courseDir: string): string {
    // Extract a clean ID from the directory name
    const match = courseDir.match(/^s-l-i-z-micro-course-(\d+)/);
    if (match) {
      return `scorm-course-${match[1]}`;
    }
    
    // Fallback to sanitized directory name
    return courseDir.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  private formatDirectoryName(dir: string): string {
    // Convert directory name to readable title
    return dir
      .replace(/^s-l-i-z-micro-course-\d+-/, '')
      .replace(/-scorm12-[a-zA-Z0-9]+$/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
