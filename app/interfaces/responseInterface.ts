export interface ControllerResponseInterface {
    result: any;
    status: number;
    details?: any;
    error?: null | string | any;
}