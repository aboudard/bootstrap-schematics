export interface InfoActuator {
  git?: Git;
  build: Build;
}
interface Build {
  version: string;
  artifact?: string;
  name?: string;
  group?: string;
  time?: string;
}

interface Git {
  commit: Commit;
  branch: string;
}

interface Commit {
  time: string;
  id: string;
}
