import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function EmailTestComponent() {
    const [emailType, setEmailType] = useState<string>("");
    const [recipient, setRecipient] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const sendGeneralNotification = useAction(api.emails.sendGeneralNotification);

    const handleSendTestEmail = async () => {
        if (!recipient || !recipientName || !emailType) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            if (emailType === "general") {
                await sendGeneralNotification({
                    to: recipient,
                    name: recipientName,
                    subject: subject || "Test Email from AI Agent Platform",
                    content: content || "<p>This is a test email to verify the email system is working correctly.</p>",
                    type: "announcement" as any,
                });
            }

            alert("Test email sent successfully!");
            // Reset form
            setRecipient("");
            setRecipientName("");
            setSubject("");
            setContent("");
        } catch (error) {
            console.error("Failed to send test email:", error);
            alert("Failed to send test email. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Testing</CardTitle>
                <CardDescription>
                    Test different types of emails to ensure the email system is working correctly
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="recipient">Recipient Email</Label>
                        <Input
                            id="recipient"
                            type="email"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="test@example.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="recipientName">Recipient Name</Label>
                        <Input
                            id="recipientName"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="emailType">Email Type</Label>
                    <Select value={emailType} onValueChange={setEmailType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select email type to test" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General Notification</SelectItem>
                            {/* Other email types would be tested through their respective flows */}
                        </SelectContent>
                    </Select>
                </div>

                {emailType === "general" && (
                    <>
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Test Email Subject"
                            />
                        </div>
                        <div>
                            <Label htmlFor="content">Content (HTML)</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="<p>Email content goes here...</p>"
                                className="min-h-[100px]"
                            />
                        </div>
                    </>
                )}

                <Button
                    onClick={handleSendTestEmail}
                    disabled={loading || !emailType}
                    className="w-full"
                >
                    {loading ? "Sending..." : "Send Test Email"}
                </Button>

                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Note:</strong> Other email types are automatically triggered:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Welcome Email:</strong> Sent when new users register</li>
                        <li><strong>Billing Notifications:</strong> Sent during Stripe webhook events</li>
                        <li><strong>Usage Alerts:</strong> Sent when users approach plan limits</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
} 