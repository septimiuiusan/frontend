import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireManager: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireStaff: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireKitchen: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireCashier: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireCustomerOrAbove: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireOwnershipOrStaff: (req: Request, res: Response, next: NextFunction) => void;
