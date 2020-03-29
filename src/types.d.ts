import { User, FileName } from "@modwatch/types";

type UploadFile = {
  content: string[];
  path: string;
  name: string;
}
interface UploadUser extends User {
  files: {
    [key in FileName]: UploadFile
  }
}
