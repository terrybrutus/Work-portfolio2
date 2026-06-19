import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Certification {
    id: bigint;
    url?: string;
    dateEarned: string;
    name: string;
    issuer: string;
}
export interface Skill {
    id: bigint;
    name: string;
    category: string;
}
export interface Resume {
    linkedIn?: string;
    title: string;
    name: string;
    education: Array<EducationEntry>;
    email: string;
    website?: string;
    experience: Array<ExperienceEntry>;
    summary: string;
    phone?: string;
    certifications: Array<Certification>;
    skills: Array<Skill>;
    location: string;
}
export interface Project {
    id: bigint;
    title: string;
    thumbnailUrl?: string;
    challenge: string;
    createdAt: bigint;
    tags: Array<string>;
    description: string;
    results: string;
    modality: Modality;
    approach: string;
    deliverables: Array<string>;
}
export interface ExperienceEntry {
    id: bigint;
    title: string;
    endDate?: string;
    description: string;
    company: string;
    achievements: Array<string>;
    location: string;
    startDate: string;
}
export interface EducationEntry {
    id: bigint;
    field: string;
    endDate?: string;
    institution: string;
    degree: string;
    startDate: string;
}
export enum Modality {
    ilt = "ilt",
    eLearning = "eLearning",
    hybrid = "hybrid",
    jobAid = "jobAid"
}
export interface backendInterface {
    addProject(project: Project): Promise<void>;
    getProject(id: bigint): Promise<Project | null>;
    getResume(): Promise<Resume | null>;
    listProjects(): Promise<Array<Project>>;
    seedPortfolio(): Promise<void>;
    seedResume(): Promise<void>;
}
