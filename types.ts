export enum EducationLevel {
  FOUNDATION = 'Class 9-10 (Foundation)',
  BOARD_LEVEL = 'Class 11-12 (CBSE/State Boards)',
  COMPETITIVE = 'JEE Mains/Advanced & NEET',
  UNDERGRADUATE = 'Undergraduate (B.Sc/B.Tech)',
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface ChemicalData {
  name: string;
  iupacName: string;
  molecularFormula: string;
  summary: string;
  keyPoints: string[];
  reactions_or_uses: string[];
  curriculumContext: string;
  webSources?: WebSource[];
  funFacts: string[];
  analogy: string;
}

export interface AnalysisState {
  isLoading: boolean;
  data: ChemicalData | null;
  error: string | null;
}