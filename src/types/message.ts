export interface RegistrationDataCmd {
  name: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
}

export interface Message {
  type: string;
  data: any;
  id: number;
}
