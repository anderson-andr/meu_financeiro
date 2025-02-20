import { AuthUser  } from "../entities/User";

declare global {
    namespace Express {
      interface Request {
        user?: AuthUser 
        
      }
    }
  }

export { AuthUser };
  