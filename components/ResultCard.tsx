import React, { useRef, useState } from 'react';
import { ChemicalData } from '../types';
import { BookOpen, Beaker, Info, GraduationCap, Download, Loader2, Lightbulb, Sparkles, Smile } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultCardProps {
  data: ChemicalData;
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    
    try {
      // Small delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = cardRef.current;
      
      // Use html2canvas with onclone to modify the document for PDF generation
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Force white background
        windowWidth: 1024, // Simulate desktop window width
        onclone: (clonedDoc) => {
            // 1. Force Light Mode in the cloned document
            clonedDoc.documentElement.classList.remove('dark');
            
            // 2. Locate the cloned card element
            const clonedCard = clonedDoc.getElementById('result-card-container');
            
            if (clonedCard) {
                // Force a specific width for the PDF
                clonedCard.style.width = '800px'; 
                clonedCard.style.maxWidth = 'none';
                clonedCard.style.margin = '0';
                clonedCard.style.boxShadow = 'none';
                clonedCard.style.borderRadius = '0';
                
                // Adjust Header
                const header = clonedCard.querySelector('.bg-gradient-to-r') as HTMLElement;
                if (header) {
                    header.style.padding = '30px 40px';
                }

                // Adjust Main Content Padding
                const mainContent = clonedCard.querySelector('.p-6.space-y-6') as HTMLElement;
                if (mainContent) {
                    mainContent.style.padding = '40px';
                }

                // Adjust Typography for PDF Readability
                const summaryP = clonedCard.querySelector('section p') as HTMLElement;
                if (summaryP) {
                    summaryP.style.fontSize = '14px';
                    summaryP.style.lineHeight = '1.8';
                    summaryP.style.textAlign = 'justify';
                    summaryP.style.color = '#334155';
                }

                // Ensure Curriculum Context box looks clean
                const contextBox = clonedCard.querySelector('.bg-rose-50') as HTMLElement;
                if (contextBox) {
                    contextBox.style.padding = '20px';
                    contextBox.style.borderLeftWidth = '6px';
                }

                // Ensure Analogy box looks clean
                const analogyBox = clonedCard.querySelector('.bg-amber-50') as HTMLElement;
                if (analogyBox) {
                    analogyBox.style.padding = '20px';
                }
            }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${data.name.replace(/\s+/g, '_')}_Analysis.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="result-card-container" ref={cardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in print:shadow-none print:border-none print:rounded-none transition-colors duration-300">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-700 p-6 text-white print:bg-none print:text-black print:border-b-2 print:border-indigo-600 print:p-0 print:pb-4 print:mb-6">
        <div className="flex justify-between items-start">
            <div className="print:flex-1 w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{data.name}</h2>
                    <p className="text-indigo-100 font-mono text-lg font-medium opacity-90">{data.molecularFormula}</p>
                  </div>
                  
                  {/* Download PDF Button */}
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-lg transition-colors print:hidden flex items-center gap-2 text-sm font-medium backdrop-blur-sm disabled:opacity-70 disabled:cursor-wait shrink-0 ml-4"
                    title="Download Analysis as PDF"
                    data-html2canvas-ignore
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                  </button>
                </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium print:hidden text-white border border-white/10 hidden sm:block shrink-0 ml-4">
                {data.iupacName}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-indigo-400/30 flex justify-between items-center text-indigo-50 text-sm">
             <span className="opacity-80 font-medium">IUPAC: {data.iupacName}</span>
             <span className="opacity-60 text-xs">GOC Visualiser AI Analysis</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Section */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400 font-semibold text-lg">
            <BookOpen size={22} className="shrink-0" />
            <h3>Educational Summary</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-100 dark:border-slate-700 text-base shadow-sm transition-colors">
            {data.summary}
          </p>
        </section>

        {/* Real World Analogy (New) */}
        {data.analogy && (
            <section>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex gap-4 items-start shadow-sm transition-colors">
                    <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full shrink-0 text-amber-600 dark:text-amber-200">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h4 className="text-amber-900 dark:text-amber-100 font-bold mb-1">Real World Analogy</h4>
                        <p className="text-amber-800 dark:text-amber-200/80 italic">
                            "{data.analogy}"
                        </p>
                    </div>
                </div>
            </section>
        )}

        {/* Two Column Layout for Facts and Reactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-transparent rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
              <Info size={22} className="shrink-0" />
              <h3>Key Properties & Facts</h3>
            </div>
            <ul className="space-y-3">
              {data.keyPoints.map((point, idx) => (
                <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-400 text-sm leading-snug">
                  <span className="text-emerald-500 dark:text-emerald-500 mt-0.5 shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-semibold text-lg">
              <Beaker size={22} className="shrink-0" />
              <h3>Common Reactions/Uses</h3>
            </div>
            <ul className="space-y-3">
              {data.reactions_or_uses.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-400 text-sm leading-snug">
                  <span className="text-amber-500 dark:text-amber-500 mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Curriculum Context */}
        <section className="mt-2">
          <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400 font-semibold text-lg">
            <GraduationCap size={22} className="shrink-0" />
            <h3>Curriculum Context</h3>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 dark:border-rose-500 p-5 rounded-r-lg transition-colors">
            <p className="text-rose-900 dark:text-rose-200 italic text-base font-medium">
              "{data.curriculumContext}"
            </p>
          </div>
        </section>

        {/* Fun Facts (New) */}
        {data.funFacts && data.funFacts.length > 0 && (
          <section className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 transition-colors">
             <div className="flex items-center gap-2 mb-4 text-violet-600 dark:text-violet-400 font-semibold text-lg">
              <Sparkles size={22} />
              <h3>Did You Know?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.funFacts.map((fact, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-violet-100 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/20 hover:shadow-md transition-all"
                >
                   <div className="mb-2 text-violet-500 dark:text-violet-400">
                     <Smile size={20} />
                   </div>
                   <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                     {fact}
                   </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResultCard;