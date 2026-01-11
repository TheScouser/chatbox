import { EmailTestComponent } from "@/components/EmailTestComponent";
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
import {
	Skeleton,
	SkeletonForm,
	SkeletonPageHeader,
} from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { detectUserLocale } from "@/lib/locale";
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/dashboard/settings/")({
	component: GeneralSettings,
});

function GeneralSettings() {
	const { t, i18n } = useTranslation();
	const user = useQuery(api.users.getCurrentUser);
	const [selectedLocale, setSelectedLocale] = useState<string>(
		i18n.language || "en",
	);
	const [localeSaved, setLocaleSaved] = useState(false);

	// Load current locale preference
	useEffect(() => {
		const currentLocale = detectUserLocale();
		setSelectedLocale(currentLocale);
		i18n.changeLanguage(currentLocale);
	}, [i18n]);

	const handleLocaleChange = (locale: string) => {
		setSelectedLocale(locale);
		setLocaleSaved(false);
	};

	const handleSaveLocale = () => {
		if (typeof window !== "undefined") {
			localStorage.setItem("chatbox_locale", selectedLocale);
			i18n.changeLanguage(selectedLocale);
			setLocaleSaved(true);
			// Reload page to apply new locale
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	};

	if (!user) {
		return (
			<div className="space-y-6">
				<SkeletonPageHeader />
				<SkeletonForm fields={3} />
				<SkeletonForm fields={2} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">{t("settings.title")}</h2>
				<p className="text-gray-600">{t("settings.description")}</p>
			</div>

			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle>{t("settings.profile.title")}</CardTitle>
					<CardDescription>{t("settings.profile.description")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="name">{t("settings.profile.fullName")}</Label>
							<Input
								id="name"
								defaultValue={user.name || ""}
								placeholder={t("settings.profile.fullNamePlaceholder")}
							/>
						</div>
						<div>
							<Label htmlFor="email">{t("settings.profile.email")}</Label>
							<Input
								id="email"
								type="email"
								defaultValue={user.email || ""}
								placeholder={t("settings.profile.emailPlaceholder")}
								disabled
							/>
							<p className="text-xs text-gray-500 mt-1">
								{t("settings.profile.emailNote")}
							</p>
						</div>
					</div>

					<div>
						<Label htmlFor="bio">{t("settings.profile.bio")}</Label>
						<Textarea
							id="bio"
							placeholder={t("settings.profile.bioPlaceholder")}
							className="min-h-[100px]"
						/>
					</div>

					<div className="flex justify-end">
						<Button>{t("settings.profile.saveChanges")}</Button>
					</div>
				</CardContent>
			</Card>

			{/* Interface Language */}
			<Card>
				<CardHeader>
					<CardTitle>{t("settings.interfaceLanguage.title")}</CardTitle>
					<CardDescription>
						{t("settings.interfaceLanguage.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="language">
							{t("settings.interfaceLanguage.dashboardLanguage")}
						</Label>
						<Select value={selectedLocale} onValueChange={handleLocaleChange}>
							<SelectTrigger id="language" className="w-full">
								<SelectValue
									placeholder={t("settings.interfaceLanguage.selectLanguage")}
								/>
							</SelectTrigger>
							<SelectContent>
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
						<p className="text-xs text-gray-500">
							{t("settings.interfaceLanguage.note")}
						</p>
						{localeSaved && (
							<p className="text-xs text-green-600">
								{t("settings.interfaceLanguage.saved")}
							</p>
						)}
					</div>
					<div className="flex justify-end">
						<Button
							variant="outline"
							onClick={handleSaveLocale}
							disabled={localeSaved}
						>
							{localeSaved
								? t("settings.interfaceLanguage.saving")
								: t("settings.interfaceLanguage.save")}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Notification Preferences */}
			<Card>
				<CardHeader>
					<CardTitle>{t("settings.notifications.title")}</CardTitle>
					<CardDescription>
						{t("settings.notifications.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">
									{t("settings.notifications.emailNotifications")}
								</p>
								<p className="text-sm text-gray-600">
									{t("settings.notifications.emailNotificationsDesc")}
								</p>
							</div>
							<input type="checkbox" defaultChecked className="rounded" />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">
									{t("settings.notifications.usageAlerts")}
								</p>
								<p className="text-sm text-gray-600">
									{t("settings.notifications.usageAlertsDesc")}
								</p>
							</div>
							<input type="checkbox" defaultChecked className="rounded" />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">
									{t("settings.notifications.productUpdates")}
								</p>
								<p className="text-sm text-gray-600">
									{t("settings.notifications.productUpdatesDesc")}
								</p>
							</div>
							<input type="checkbox" className="rounded" />
						</div>
					</div>

					<div className="flex justify-end">
						<Button variant="outline">
							{t("settings.notifications.updatePreferences")}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Email Testing */}
			<EmailTestComponent />

			{/* Account Actions */}
			<Card>
				<CardHeader>
					<CardTitle>{t("settings.accountActions.title")}</CardTitle>
					<CardDescription>
						{t("settings.accountActions.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button variant="outline">
							{t("settings.accountActions.exportData")}
						</Button>
						<Button variant="outline">
							{t("settings.accountActions.downloadInvoices")}
						</Button>
					</div>

					<hr />

					<div className="space-y-2">
						<p className="font-medium text-red-600">
							{t("settings.accountActions.dangerZone")}
						</p>
						<p className="text-sm text-gray-600">
							{t("settings.accountActions.dangerZoneDesc")}
						</p>
						<Button variant="destructive" size="sm">
							{t("settings.accountActions.deleteAccount")}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
