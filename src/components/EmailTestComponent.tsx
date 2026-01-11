import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "convex/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";

export function EmailTestComponent() {
	const { t } = useTranslation();
	const [emailType, setEmailType] = useState<string>("");
	const [recipient, setRecipient] = useState("");
	const [recipientName, setRecipientName] = useState("");
	const [subject, setSubject] = useState("");
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(false);

	const sendGeneralNotification = useAction(api.emails.sendGeneralNotification);

	const handleSendTestEmail = async () => {
		if (!recipient || !recipientName || !emailType) {
			alert(t("settings.emailTesting.fillAllFields"));
			return;
		}

		setLoading(true);
		try {
			if (emailType === "general") {
				await sendGeneralNotification({
					to: recipient,
					name: recipientName,
					subject: subject || t("settings.emailTesting.defaultSubject"),
					content: content || t("settings.emailTesting.defaultContent"),
					type: "announcement",
				});
			}

			alert(t("settings.emailTesting.success"));
			// Reset form
			setRecipient("");
			setRecipientName("");
			setSubject("");
			setContent("");
		} catch (error) {
			console.error("Failed to send test email:", error);
			alert(t("settings.emailTesting.error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("settings.emailTesting.title")}</CardTitle>
				<CardDescription>
					{t("settings.emailTesting.description")}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="recipient">
							{t("settings.emailTesting.recipientEmail")}
						</Label>
						<Input
							id="recipient"
							type="email"
							value={recipient}
							onChange={(e) => setRecipient(e.target.value)}
							placeholder={t("settings.emailTesting.recipientEmailPlaceholder")}
						/>
					</div>
					<div>
						<Label htmlFor="recipientName">
							{t("settings.emailTesting.recipientName")}
						</Label>
						<Input
							id="recipientName"
							value={recipientName}
							onChange={(e) => setRecipientName(e.target.value)}
							placeholder={t("settings.emailTesting.recipientNamePlaceholder")}
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="emailType">
						{t("settings.emailTesting.emailType")}
					</Label>
					<Select value={emailType} onValueChange={setEmailType}>
						<SelectTrigger>
							<SelectValue
								placeholder={t("settings.emailTesting.selectEmailType")}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="general">
								{t("settings.emailTesting.generalNotification")}
							</SelectItem>
							{/* Other email types would be tested through their respective flows */}
						</SelectContent>
					</Select>
				</div>

				{emailType === "general" && (
					<>
						<div>
							<Label htmlFor="subject">
								{t("settings.emailTesting.subject")}
							</Label>
							<Input
								id="subject"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								placeholder={t("settings.emailTesting.subjectPlaceholder")}
							/>
						</div>
						<div>
							<Label htmlFor="content">
								{t("settings.emailTesting.content")}
							</Label>
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder={t("settings.emailTesting.contentPlaceholder")}
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
					{loading
						? t("settings.emailTesting.sending")
						: t("settings.emailTesting.sendTestEmail")}
				</Button>

				<div className="text-sm text-gray-600 space-y-1">
					<p>
						<strong>{t("settings.emailTesting.note")}</strong>{" "}
						{t("settings.emailTesting.noteText")}
					</p>
					<ul className="list-disc list-inside space-y-1 ml-4">
						<li>
							<strong>{t("settings.emailTesting.welcomeEmail")}:</strong>{" "}
							{t("settings.emailTesting.welcomeEmailDesc")}
						</li>
						<li>
							<strong>
								{t("settings.emailTesting.billingNotifications")}:
							</strong>{" "}
							{t("settings.emailTesting.billingNotificationsDesc")}
						</li>
						<li>
							<strong>{t("settings.emailTesting.usageAlerts")}:</strong>{" "}
							{t("settings.emailTesting.usageAlertsDesc")}
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
