export class Gradients {
    static whiteGradientText =
      "bg-gradient-to-b from-agwhite to-[#999999] text-transparent bg-clip-text";
  
    static whiteToGrey = "bg-gradient-to-b from-agwhite to-[#999999]";
  
    static redToBlue = "bg-gradient-to-tr from-brred to-brblue";
  
    static tableBlue = "bg-gradient-to-b from-[#0A1133] to-[#142266]";
  
    static lightBlue = "bg-gradient-to-b from-[#B4EBF8] to-[#789DFA]";
  
    static darkBlue = "bg-gradient-to-tr from-[#15004C] to-[#3C00DC]";
  }
  
  export class Shapes {
    static pill =
      "rounded-full py-[4px] px-[8px] flex justify-center items-center gap-[4px] select-none";
  
    static dataCard = "rounded-[6px] px-[12px] py-[16px]";
  }
  
  export class Backdrop {
    static blur =
      "absolute inset-0 w-full h-full rounded-[inherit] blur-lg z-[1] ";
  
    static darkOverlay =
      "absolute inset-0 w-full h-full bg-gradient-to-b from-agblack via-agblack/0 to-agblack";
  }
  