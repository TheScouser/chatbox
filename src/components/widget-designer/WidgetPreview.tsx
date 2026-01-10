import { useState } from "react";
import { MessageSquare, X, MoreHorizontal, ArrowUp, Bot } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type WidgetConfig = {
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

interface WidgetPreviewProps {
    config: WidgetConfig;
    texts: WidgetTexts;
}

export function WidgetPreview({ config, texts }: WidgetPreviewProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="relative flex justify-center">
            {/* Closed state - bubble */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: config.branding.primaryColor }}
                >
                    <MessageSquare className="text-white h-6 w-6" />
                </button>
            )}

            {/* Open state - chat window */}
            {isOpen && (
                <div
                    className="bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden"
                    style={{
                        width: `${config.interface.width}px`,
                        height: `${config.interface.height}px`,
                        maxWidth: "100%",
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-4 flex items-center justify-between flex-shrink-0"
                        style={{
                            backgroundColor: config.branding.primaryColor,
                            color: config.branding.foregroundColor,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            {config.branding.showHeaderIcon && (
                                <div
                                    className={`w-8 h-8 bg-white/20 flex items-center justify-center ${config.branding.headerIconCircular ? "rounded-full" : "rounded"
                                        }`}
                                >
                                    <Bot className="h-5 w-5" />
                                </div>
                            )}
                            <span className="font-semibold">{texts.headerTitle}</span>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="p-1 hover:bg-white/20 rounded">
                                <MoreHorizontal size={16} />
                            </button>
                            <button
                                type="button"
                                className="p-1 hover:bg-white/20 rounded"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 p-4 overflow-y-auto min-h-0">
                        {/* Greeting messages */}
                        {texts.greetingMessages.map((msg, i) => (
                            <div key={i} className="flex gap-2 mb-3">
                                <div
                                    className={`w-6 h-6 bg-gray-200 flex items-center justify-center flex-shrink-0 ${config.branding.botAvatarCircular ? "rounded-full" : "rounded"
                                        }`}
                                >
                                    <Bot className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                                    {msg.type === "text" ? (
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            [{msg.type}: {msg.content}]
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Sample user message */}
                        <div className="flex justify-end mb-3">
                            <div
                                className="rounded-lg px-3 py-2 max-w-[80%] text-sm text-white"
                                style={{ backgroundColor: config.branding.primaryColor }}
                            >
                                Just testing things out 🙌
                            </div>
                        </div>

                        {/* Sample response */}
                        <div className="flex gap-2">
                            <div
                                className={`w-6 h-6 bg-gray-200 flex items-center justify-center flex-shrink-0 ${config.branding.botAvatarCircular ? "rounded-full" : "rounded"
                                    }`}
                            >
                                <Bot className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
                                <p className="text-sm">Sure! Let me know if you have any questions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Input area */}
                    <div className="p-4 border-t flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                placeholder={texts.inputPlaceholder}
                                disabled
                            />
                            <button
                                type="button"
                                className="p-2 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: config.branding.primaryColor }}
                            >
                                <ArrowUp className="text-white" size={16} />
                            </button>
                        </div>
                        {!config.config.hidePoweredBy && (
                            <div className="text-center text-xs text-gray-400 mt-2">
                                Powered by Chatbox
                            </div>
                        )}
                        {texts.footerText && (
                            <div className="text-center text-xs text-gray-500 mt-2">
                                {texts.footerText}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
