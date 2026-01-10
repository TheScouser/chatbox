import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LANGUAGES } from "@/lib/languages";
import { Info } from "lucide-react";

type WidgetConfig = {
    interface: {
        position: "bottom-right" | "bottom-left";
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        language?: string; // "auto" or locale code like "en", "es", etc.
    };
};

interface InterfaceTabProps {
    config: WidgetConfig;
    onChange: (updates: Partial<WidgetConfig>) => void;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {children}
        </div>
    );
}

export function InterfaceTab({ config, onChange }: InterfaceTabProps) {
    const currentLanguage = config.interface.language || "auto";

    return (
        <div className="space-y-8">
            <FormSection title="General">
                <div className="space-y-2">
                    <Label>Widget Language</Label>
                    <Select
                        value={currentLanguage}
                        onValueChange={(value) => onChange({
                            interface: { ...config.interface, language: value },
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">
                                <span className="flex items-center gap-2">
                                    <span>Auto</span>
                                </span>
                            </SelectItem>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                    <span className="flex items-center gap-2">
                                        <span>{lang.flag}</span>
                                        <span>{lang.name}</span>
                                        <span className="text-muted-foreground">
                                            ({lang.nativeName})
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            "Auto" sets the language automatically based on the user's browser settings.
                        </p>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Position">
                <div className="space-y-2">
                    <Label>Widget Position</Label>
                    <Select
                        value={config.interface.position}
                        onValueChange={(value: "bottom-right" | "bottom-left") => onChange({
                            interface: { ...config.interface, position: value },
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </FormSection>

            <FormSection title="Offset">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Offset X ({config.interface.offsetX}px)</Label>
                        <Slider
                            value={[config.interface.offsetX]}
                            onValueChange={([value]) => onChange({
                                interface: { ...config.interface, offsetX: value },
                            })}
                            min={0}
                            max={100}
                            step={5}
                        />
                        <Input
                            type="number"
                            value={config.interface.offsetX}
                            onChange={(e) => onChange({
                                interface: { ...config.interface, offsetX: Number.parseInt(e.target.value) || 0 },
                            })}
                            min={0}
                            max={100}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Offset Y ({config.interface.offsetY}px)</Label>
                        <Slider
                            value={[config.interface.offsetY]}
                            onValueChange={([value]) => onChange({
                                interface: { ...config.interface, offsetY: value },
                            })}
                            min={0}
                            max={100}
                            step={5}
                        />
                        <Input
                            type="number"
                            value={config.interface.offsetY}
                            onChange={(e) => onChange({
                                interface: { ...config.interface, offsetY: Number.parseInt(e.target.value) || 0 },
                            })}
                            min={0}
                            max={100}
                            className="w-full"
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection title="Size">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Width</Label>
                        <Select
                            value={config.interface.width.toString()}
                            onValueChange={(value) => onChange({
                                interface: { ...config.interface, width: Number.parseInt(value) },
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="300">300px</SelectItem>
                                <SelectItem value="350">350px</SelectItem>
                                <SelectItem value="400">400px</SelectItem>
                                <SelectItem value="450">450px</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Height</Label>
                        <Select
                            value={config.interface.height.toString()}
                            onValueChange={(value) => onChange({
                                interface: { ...config.interface, height: Number.parseInt(value) },
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="400">400px</SelectItem>
                                <SelectItem value="450">450px</SelectItem>
                                <SelectItem value="500">500px</SelectItem>
                                <SelectItem value="550">550px</SelectItem>
                                <SelectItem value="600">600px</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
