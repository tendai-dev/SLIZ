import React, { useRef } from 'react';
import { Download, Share2, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CertificateGeneratorProps {
  userName: string;
  coursesCompleted: string[];
  certificateId: string;
  issueDate: string;
}

export function CertificateGenerator({ 
  userName, 
  coursesCompleted, 
  certificateId,
  issueDate 
}: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In production, this would generate a PDF
    if (certificateRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 1200;
        canvas.height = 850;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add certificate content
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Achievement', canvas.width / 2, 150);
        
        ctx.font = '24px serif';
        ctx.fillText('This is to certify that', canvas.width / 2, 250);
        
        ctx.font = 'bold 36px serif';
        ctx.fillText(userName, canvas.width / 2, 320);
        
        ctx.font = '20px serif';
        ctx.fillText('has successfully completed the following courses:', canvas.width / 2, 400);
        
        // List courses
        ctx.font = '18px serif';
        coursesCompleted.forEach((course, index) => {
          ctx.fillText(`• ${course}`, canvas.width / 2, 460 + (index * 30));
        });
        
        // Add issuing organizations
        ctx.font = '16px serif';
        ctx.fillText('Issued by', canvas.width / 2, 650);
        ctx.font = 'bold 20px serif';
        ctx.fillText('Sports Leaders Institute of Zimbabwe', canvas.width / 2, 680);
        ctx.fillText('in partnership with West Virginia University', canvas.width / 2, 710);
        
        // Add date and ID
        ctx.font = '14px serif';
        ctx.fillText(`Date: ${issueDate}`, canvas.width / 2, 770);
        ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, 800);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SLIZ_Certificate_${certificateId}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My SLIZ Certificate',
        text: `I've completed ${coursesCompleted.length} courses and earned my certificate from Sports Leaders Institute of Zimbabwe!`,
        url: window.location.href
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <Card className="overflow-hidden">
        <div 
          ref={certificateRef}
          className="relative p-12 bg-gradient-to-br from-blue-900 via-purple-800 to-purple-900 text-white"
        >
          {/* Certificate Border */}
          <div className="absolute inset-4 border-4 border-yellow-400/30 rounded-lg"></div>
          <div className="absolute inset-6 border-2 border-yellow-400/20 rounded-lg"></div>
          
          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Header */}
            <div className="flex justify-center mb-4">
              <Award className="w-16 h-16 text-yellow-400" />
            </div>
            
            <h1 className="text-4xl font-bold font-serif tracking-wide">
              Certificate of Achievement
            </h1>
            
            <p className="text-lg opacity-90">This is to certify that</p>
            
            <h2 className="text-3xl font-bold text-yellow-400 py-2">
              {userName}
            </h2>
            
            <p className="text-lg opacity-90">
              has successfully completed the following courses with distinction:
            </p>
            
            {/* Completed Courses */}
            <div className="space-y-2 py-4">
              {coursesCompleted.map((course, index) => (
                <div key={index} className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-base">{course}</span>
                </div>
              ))}
            </div>
            
            {/* Issuing Organizations */}
            <div className="pt-6 space-y-2">
              <p className="text-sm opacity-80">Issued by</p>
              <div className="space-y-1">
                <p className="text-xl font-bold">Sports Leaders Institute of Zimbabwe</p>
                <p className="text-lg opacity-90">in partnership with</p>
                <p className="text-xl font-bold">West Virginia University</p>
              </div>
            </div>
            
            {/* Signatures Section */}
            <div className="flex justify-around pt-8">
              <div className="text-center">
                <div className="w-32 h-0.5 bg-white/50 mx-auto mb-2"></div>
                <p className="text-sm opacity-80">Program Director</p>
                <p className="text-xs opacity-60">SLIZ</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-0.5 bg-white/50 mx-auto mb-2"></div>
                <p className="text-sm opacity-80">Academic Partner</p>
                <p className="text-xs opacity-60">WVU</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-6 text-xs opacity-60 space-y-1">
              <p>Issue Date: {issueDate}</p>
              <p>Certificate ID: {certificateId}</p>
              <p>This certificate is verifiable at sliz.edu.zw/verify</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleDownload}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Certificate
        </Button>
        
        <Button 
          onClick={handleShare}
          size="lg"
          variant="outline"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Achievement
        </Button>
      </div>
    </div>
  );
}
