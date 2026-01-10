import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brush, Layout, Type, Settings, Plus, Loader2 } from "lucide-react";
import { BrandingTab } from "@/components/widget-designer/BrandingTab";
import { InterfaceTab } from "@/components/widget-designer/InterfaceTab";
import { TextsTab } from "@/components/widget-designer/TextsTab";
import { ConfigureTab } from "@/components/widget-designer/ConfigureTab";
import { WidgetPreview } from "@/components/widget-designer/WidgetPreview";

export const Route = createFileRoute("/dashboard/agents/$agentId/widget")({
    component: WidgetDesigner,
});

type WidgetConfig = {
    _id: Id<"widgetConfigurations">;
    agentId: Id<"agents">;
    name: string;
    isDefault: boolean;
    branding: {
        logoStorageId?: Id<"_storage">;
        primaryColor: string;
        foregroundColor: string;
        showHeaderIcon: boolean;
        headerIconCircular: boolean;
        botAvatarCircular: boolean;
        botAvatarType: "logo" | "custom";
        botAvatarStorageId?: Id<"_storage">;
    };
    interface: {
        position: "bottom-right" | "bottom-left";
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        language?: string; // "auto" or locale code
    };
    aiSettings: {
        model: string;
        temperature: number;
        maxTokens: number;
    };
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

type WidgetTexts = {
    headerTitle: string;
    inputPlaceholder: string;
    greetingMessages: Array<{
        type: "text" | "image" | "video";
        content: string;
    }>;
    quickReplies: string[];
    footerText?: string;
    offlineMessage?: string;
};

function WidgetDesigner() {
    const { agentId } = Route.useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"branding" | "interface" | "texts" | "configure">("branding");
    const [selectedWidgetId, setSelectedWidgetId] = useState<Id<"widgetConfigurations"> | null>(null);

    // Local state for unsaved changes
    const [localConfig, setLocalConfig] = useState<WidgetConfig | null>(null);
    const [localTexts, setLocalTexts] = useState<WidgetTexts | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Fetch widgets for agent
    const widgets = useQuery(api.widgetConfig.getWidgetConfigsForAgent, {
        agentId: agentId as Id<"agents">
    });

    // Fetch selected widget config and texts
    const widgetConfigData = useQuery(
        api.widgetConfig.getWidgetConfigById,
        selectedWidgetId ? { widgetConfigId: selectedWidgetId } : "skip"
    );

    // Mutations
    const updateConfig = useMutation(api.widgetConfig.updateWidgetConfig);
    const createConfig = useMutation(api.widgetConfig.createWidgetConfig);
    const updateTexts = useMutation(api.widgetTexts.upsertWidgetTexts);

    // Initialize local state when widget data loads
    useEffect(() => {
        if (widgetConfigData) {
            // Extract config (everything except texts)
            const { texts, ...config } = widgetConfigData;
            setLocalConfig(config as any);
            // Get default locale texts
            const defaultTexts = texts?.find(t => t.isDefault);
            if (defaultTexts) {
                setLocalTexts(defaultTexts.texts as any);
            } else if (texts && texts.length > 0) {
                // Fallback to first text if no default found
                setLocalTexts(texts[0].texts as any);
            }
            setIsDirty(false);
        }
    }, [widgetConfigData]);

    // Auto-select first widget or default widget
    useEffect(() => {
        if (widgets && widgets.length > 0 && !selectedWidgetId) {
            const defaultWidget = widgets.find(w => w.isDefault);
            if (defaultWidget) {
                setSelectedWidgetId(defaultWidget._id);
            } else {
                setSelectedWidgetId(widgets[0]._id);
            }
        }
    }, [widgets, selectedWidgetId]);

    const handleConfigChange = (updates: Partial<WidgetConfig>) => {
        if (localConfig) {
            setLocalConfig({ ...localConfig, ...updates });
            setIsDirty(true);
        }
    };

    const handleTextsChange = (updates: Partial<WidgetTexts>) => {
        if (localTexts) {
            setLocalTexts({ ...localTexts, ...updates });
            setIsDirty(true);
        }
    };

    const handleSave = async () => {
        if (!localConfig || !localTexts || !selectedWidgetId) return;

        try {
            // Update config
            await updateConfig({
                widgetConfigId: selectedWidgetId,
                name: localConfig.name,
                branding: localConfig.branding,
                interface: localConfig.interface,
                aiSettings: localConfig.aiSettings,
                config: localConfig.config,
            });

            // Update texts (default locale)
            await updateTexts({
                widgetConfigId: selectedWidgetId,
                locale: "en",
                isDefault: true,
                texts: localTexts,
            });

            setIsDirty(false);
        } catch (error) {
            console.error("Error saving widget:", error);
            alert("Failed to save widget configuration");
        }
    };

    const handleCreateNew = async () => {
        try {
            const newWidgetId = await createConfig({
                agentId: agentId as Id<"agents">,
                name: "New Widget",
                isDefault: widgets?.length === 0, // Make it default if it's the first widget
            });
            setSelectedWidgetId(newWidgetId);
        } catch (error) {
            console.error("Error creating widget:", error);
            alert("Failed to create widget");
        }
    };

    if (widgets === undefined) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // If no widgets exist, show create button
    if (widgets.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">No Widgets Yet</h2>
                    <p className="text-muted-foreground mb-4">
                        Create your first widget to get started
                    </p>
                    <Button onClick={handleCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Widget
                    </Button>
                </div>
            </div>
        );
    }

    // If widget is selected but data is still loading
    if (selectedWidgetId && (!localConfig || !localTexts)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // If no widget selected yet (shouldn't happen, but safety check)
    if (!selectedWidgetId || !localConfig || !localTexts) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] -mx-6 -my-6 bg-background min-h-[600px]">
            {/* Left Panel - Settings */}
            <div className="w-[420px] border-r border-border flex flex-col bg-background">
                {/* Header with Back, Widget selector, Save button */}
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: `/dashboard/agents/${agentId}` })}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Back
                    </Button>
                    <div className="flex-1 min-w-0">
                        <Select
                            value={selectedWidgetId || ""}
                            onValueChange={(value) => setSelectedWidgetId(value as Id<"widgetConfigurations">)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select widget" />
                            </SelectTrigger>
                            <SelectContent>
                                {widgets.map((widget) => (
                                    <SelectItem key={widget._id} value={widget._id}>
                                        {widget.name} {widget.isDefault && "(Default)"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            onClick={handleCreateNew}
                            variant="outline"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            New
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!isDirty}
                        >
                            Save
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="w-full rounded-none border-b border-border bg-transparent px-6 h-12">
                        <TabsTrigger value="branding" className="flex-1 gap-1.5 data-[state=active]:bg-transparent">
                            <Brush className="h-4 w-4" />
                            <span>Branding</span>
                        </TabsTrigger>
                        <TabsTrigger value="interface" className="flex-1 gap-1.5 data-[state=active]:bg-transparent">
                            <Layout className="h-4 w-4" />
                            <span>Interface</span>
                        </TabsTrigger>
                        <TabsTrigger value="texts" className="flex-1 gap-1.5 data-[state=active]:bg-transparent">
                            <Type className="h-4 w-4" />
                            <span>Texts</span>
                        </TabsTrigger>
                        <TabsTrigger value="configure" className="flex-1 gap-1.5 data-[state=active]:bg-transparent">
                            <Settings className="h-4 w-4" />
                            <span>Configure</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <TabsContent value="branding" className="mt-0">
                            <BrandingTab
                                config={localConfig}
                                onChange={handleConfigChange}
                                agentId={agentId as Id<"agents">}
                            />
                        </TabsContent>
                        <TabsContent value="interface" className="mt-0">
                            <InterfaceTab
                                config={localConfig}
                                onChange={handleConfigChange}
                            />
                        </TabsContent>
                        <TabsContent value="texts" className="mt-0">
                            <TextsTab
                                texts={localTexts}
                                onChange={handleTextsChange}
                                widgetConfigId={selectedWidgetId!}
                            />
                        </TabsContent>
                        <TabsContent value="configure" className="mt-0">
                            <ConfigureTab
                                config={localConfig}
                                onChange={handleConfigChange}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-muted/20 flex items-center justify-center p-12">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-1">Chatbot Preview</h3>
                        <p className="text-sm text-muted-foreground">See how your widget will look to users</p>
                    </div>
                    <WidgetPreview config={localConfig} texts={localTexts} />
                </div>
            </div>
        </div>
    );
}
