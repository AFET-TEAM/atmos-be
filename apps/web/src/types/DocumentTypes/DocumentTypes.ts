 export type Field = {
    key: string;                
    label: string;              
    type?: "text" | "url" | "textarea" | "number" | "email" | "password" | "file";
    placeholder?: string;
    required?: boolean;        
    value?: string | number;     
    autoFocus?: boolean;        
  };