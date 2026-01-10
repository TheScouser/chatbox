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
import { Skeleton, SkeletonForm, SkeletonPageHeader } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/settings/")({
	component: GeneralSettings,
});

function GeneralSettings() {
	const user = useQuery(api.users.getCurrentUser);

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
				<h2 className="text-2xl font-bold">General Settings</h2>
				<p className="text-gray-600">
					Manage your account settings and preferences
				</p>
			</div>

			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your account information and how others see you
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								defaultValue={user.name || ""}
								placeholder="Enter your full name"
							/>
						</div>
						<div>
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								defaultValue={user.email || ""}
								placeholder="Enter your email"
								disabled
							/>
							<p className="text-xs text-gray-500 mt-1">
								Email changes are managed through your account provider
							</p>
						</div>
					</div>

					<div>
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							placeholder="Tell us a bit about yourself..."
							className="min-h-[100px]"
						/>
					</div>

					<div className="flex justify-end">
						<Button>Save Changes</Button>
					</div>
				</CardContent>
			</Card>

			{/* Notification Preferences */}
			<Card>
				<CardHeader>
					<CardTitle>Notification Preferences</CardTitle>
					<CardDescription>
						Choose how you want to be notified about important updates
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Email Notifications</p>
								<p className="text-sm text-gray-600">
									Receive email updates about your agents and usage
								</p>
							</div>
							<input type="checkbox" defaultChecked className="rounded" />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Usage Alerts</p>
								<p className="text-sm text-gray-600">
									Get notified when approaching plan limits
								</p>
							</div>
							<input type="checkbox" defaultChecked className="rounded" />
						</div>

						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Product Updates</p>
								<p className="text-sm text-gray-600">
									Stay informed about new features and improvements
								</p>
							</div>
							<input type="checkbox" className="rounded" />
						</div>
					</div>

					<div className="flex justify-end">
						<Button variant="outline">Update Preferences</Button>
					</div>
				</CardContent>
			</Card>

			{/* Email Testing */}
			<EmailTestComponent />

			{/* Account Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Account Actions</CardTitle>
					<CardDescription>Manage your account and data</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button variant="outline">Export Data</Button>
						<Button variant="outline">Download Invoice History</Button>
					</div>

					<hr />

					<div className="space-y-2">
						<p className="font-medium text-red-600">Danger Zone</p>
						<p className="text-sm text-gray-600">
							These actions cannot be undone. Please be careful.
						</p>
						<Button variant="destructive" size="sm">
							Delete Account
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
