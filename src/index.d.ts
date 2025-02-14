export interface MonacoTheme {
    base: "vs-dark" | "vs";
    inherit: boolean;
    rules: {
        token: string;
        foreground?: string;
        background?: string;
        fontStyle?: string;
    }[];
    colors: Record<string, string>;
}

export function parseTmTheme(theme: string): MonacoTheme;