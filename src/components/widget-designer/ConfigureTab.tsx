import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

type WidgetConfig = {
    config: {
        hidePoweredBy: boolean;
        showRating: boolean;
        allowTranscriptDownload: boolean;
        voiceInputEnabled: boolean;
        voiceMaxDuration: number;
        showAiSources: boolean;
        hoveringMessageDesktop: boolean;
        hoveringMessageMobile: boolean;
        autoOpenChat: boolean;
        autoOpenDelay: number;
    };
};

interface ConfigureTabProps {
    config: WidgetConfig;
    onChange: (updates: Partial<WidgetConfig>) => void;
}

function FormSection({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description && <p className="text-xs text-muted-foreground mt-1.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function ToggleRow({
    label,
    checked,
    onChange,
    disabled,
    upgradePrompt
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    upgradePrompt?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <Label className="text-sm">{label}</Label>
                {upgradePrompt && disabled && (
                    <p className="text-xs text-muted-foreground mt-1">{upgradePrompt}</p>
                )}
            </div>
            <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
        </div>
    );
}

export function ConfigureTab({ config, onChange }: ConfigureTabProps) {
    const customBrandingAccess = useFeatureAccess("custom_branding");

    return (
        <div className="space-y-8">
            <FormSection title="General">
                <div className="space-y-3">
                    <ToggleRow
                        label='Hide "Powered by Chatbox" text'
                        checked={config.config.hidePoweredBy}
                        onChange={(v) => onChange({
                            config: { ...config.config, hidePoweredBy: v },
                        })}
                        disabled={!customBrandingAccess.hasAccess}
                        upgradePrompt={!customBrandingAccess.hasAccess ? "Upgrade plan to use this option" : undefined}
                    />
                    <ToggleRow
                        label="Display rating for AI responses"
                        checked={config.config.showRating}
                        onChange={(v) => onChange({
                            config: { ...config.config, showRating: v },
                        })}
                    />
                    <ToggleRow
                        label="Allow users to download chat transcript"
                        checked={config.config.allowTranscriptDownload}
                        onChange={(v) => onChange({
                            config: { ...config.config, allowTranscriptDownload: v },
                        })}
                    />
                </div>
            </FormSection>

            <FormSection
                title="Voice Input"
                description="Allows users to send messages by voice (speech-to-text). Will count towards your speech-to-text usage limit."
            >
                <div className="space-y-3">
                    <ToggleRow
                        label="Enable"
                        checked={config.config.voiceInputEnabled}
                        onChange={(v) => onChange({
                            config: { ...config.config, voiceInputEnabled: v },
                        })}
                    />
                    {config.config.voiceInputEnabled && (
                        <div className="space-y-2">
                            <Label>Max duration (seconds)</Label>
                            <Input
                                type="number"
                                value={config.config.voiceMaxDuration}
                                onChange={(e) => onChange({
                                    config: { ...config.config, voiceMaxDuration: Number.parseInt(e.target.value) || 60 },
                                })}
                                min={5}
                                max={120}
                                placeholder="5 - 120"
                            />
                            <p className="text-xs text-muted-foreground">
                                The maximum duration of a voice recording. Leave blank for default (60 seconds).
                            </p>
                        </div>
                    )}
                </div>
            </FormSection>

            <FormSection
                title="AI Response Sources"
                description="Displays the knowledge base sources used by the AI for its answers."
            >
                <ToggleRow
                    label="Enable"
                    checked={config.config.showAiSources}
                    onChange={(v) => onChange({
                        config: { ...config.config, showAiSources: v },
                    })}
                />
            </FormSection>

            <FormSection
                title="Hovering Message"
                description="Improve chatbot's engagement rate with attention-grabbing messages that appear over the chat icon."
            >
                <div className="space-y-3">
                    <ToggleRow
                        label="Enable on desktop"
                        checked={config.config.hoveringMessageDesktop}
                        onChange={(v) => onChange({
                            config: { ...config.config, hoveringMessageDesktop: v },
                        })}
                    />
                    <ToggleRow
                        label="Enable on mobile"
                        checked={config.config.hoveringMessageMobile}
                        onChange={(v) => onChange({
                            config: { ...config.config, hoveringMessageMobile: v },
                        })}
                    />
                </div>
            </FormSection>

            <FormSection
                title="Auto-open Chat"
                description="Automatically opens the chat when the user visits your website."
            >
                <div className="space-y-3">
                    <ToggleRow
                        label="Enable"
                        checked={config.config.autoOpenChat}
                        onChange={(v) => onChange({
                            config: { ...config.config, autoOpenChat: v },
                        })}
                    />
                    {config.config.autoOpenChat && (
                        <div className="space-y-2">
                            <Label>Delay (seconds)</Label>
                            <Input
                                type="number"
                                value={config.config.autoOpenDelay}
                                onChange={(e) => onChange({
                                    config: { ...config.config, autoOpenDelay: Number.parseInt(e.target.value) || 3 },
                                })}
                                min={0}
                                max={60}
                            />
                        </div>
                    )}
                </div>
            </FormSection>
        </div>
    );
}
