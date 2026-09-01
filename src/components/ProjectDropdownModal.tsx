import { type Project } from "../data/projectsData";

interface ProjectDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
}

export function ProjectDropdownModal(_props: ProjectDropdownModalProps) {
  return null;
}
