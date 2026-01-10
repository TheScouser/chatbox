import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, GripVertical } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

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

interface TextsTabProps {
    texts: WidgetTexts;
    onChange: (updates: Partial<WidgetTexts>) => void;
    widgetConfigId: Id<"widgetConfigurations">;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {children}
        </div>
    );
}

export function TextsTab({ texts, onChange, widgetConfigId }: TextsTabProps) {
    const addGreetingMessage = () => {
        onChange({
            greetingMessages: [
                ...texts.greetingMessages,
                { type: "text", content: "" },
            ],
        });
    };

    const updateGreetingMessage = (index: number, updates: Partial<WidgetTexts["greetingMessages"][0]>) => {
        const updated = [...texts.greetingMessages];
        updated[index] = { ...updated[index], ...updates };
        onChange({ greetingMessages: updated });
    };

    const removeGreetingMessage = (index: number) => {
        onChange({
            greetingMessages: texts.greetingMessages.filter((_, i) => i !== index),
        });
    };

    const addQuickReply = () => {
        onChange({
            quickReplies: [...texts.quickReplies, ""],
        });
    };

    const updateQuickReply = (index: number, value: string) => {
        const updated = [...texts.quickReplies];
        updated[index] = value;
        onChange({ quickReplies: updated });
    };

    const removeQuickReply = (index: number) => {
        onChange({
            quickReplies: texts.quickReplies.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-8">
            <FormSection title="Header Title">
                <Input
                    value={texts.headerTitle}
                    onChange={(e) => onChange({ headerTitle: e.target.value })}
                    placeholder="Support Agent"
                />
            </FormSection>

            <FormSection title="Input Placeholder">
                <Input
                    value={texts.inputPlaceholder}
                    onChange={(e) => onChange({ inputPlaceholder: e.target.value })}
                    placeholder="Type here..."
                />
            </FormSection>

            <FormSection title="Greeting Messages">
                <div className="space-y-3">
                    {texts.greetingMessages.map((msg, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Message {index + 1}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeGreetingMessage(index)}
                                    className="h-6 w-6"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Select
                                    value={msg.type}
                                    onValueChange={(value: "text" | "image" | "video") =>
                                        updateGreetingMessage(index, { type: value, content: "" })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                                {msg.type === "text" ? (
                                    <Textarea
                                        value={msg.content}
                                        onChange={(e) => updateGreetingMessage(index, { content: e.target.value })}
                                        placeholder="Enter greeting message..."
                                        rows={3}
                                    />
                                ) : (
                                    <Input
                                        value={msg.content}
                                        onChange={(e) => updateGreetingMessage(index, { content: e.target.value })}
                                        placeholder={`Enter ${msg.type} URL...`}
                                    />
                                )}
                                {msg.type === "text" && (
                                    <p className="text-xs text-muted-foreground">
                                        {msg.content.length}/500 characters
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGreetingMessage}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Message
                    </Button>
                </div>
            </FormSection>

            <FormSection title="Quick Replies">
                <div className="space-y-2">
                    {texts.quickReplies.map((reply, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={reply}
                                onChange={(e) => updateQuickReply(index, e.target.value)}
                                placeholder="Quick reply text..."
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuickReply(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuickReply}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Quick Reply
                    </Button>
                </div>
            </FormSection>

            <FormSection title="Footer Text">
                <Textarea
                    value={texts.footerText || ""}
                    onChange={(e) => onChange({ footerText: e.target.value })}
                    placeholder="Footer text (optional)"
                    rows={2}
                />
            </FormSection>

            <FormSection title="Offline Message">
                <Textarea
                    value={texts.offlineMessage || ""}
                    onChange={(e) => onChange({ offlineMessage: e.target.value })}
                    placeholder="We're currently offline. Please leave a message."
                    rows={2}
                />
            </FormSection>
        </div>
    );
}
