import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Crown } from "lucide-react"

export const Route = createFileRoute('/dashboard/settings/members')({
    component: MembersSettings,
})

function MembersSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Team Members</h2>
                <p className="text-gray-600">Manage your team and collaboration settings</p>
            </div>

            {/* Coming Soon Notice */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Collaboration - Coming Soon
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        We're building powerful team features to help you collaborate with your team members.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-blue-900">Planned Features:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Invite team members</li>
                                <li>• Role-based permissions</li>
                                <li>• Shared agent workspaces</li>
                                <li>• Activity monitoring</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-blue-900">Benefits:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Collaborate on agents</li>
                                <li>• Manage team access</li>
                                <li>• Track team activity</li>
                                <li>• Share knowledge bases</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Current User */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Members</CardTitle>
                    <CardDescription>
                        People with access to this workspace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Crown className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">You (Owner)</p>
                                <p className="text-sm text-gray-600">Full access to all features</p>
                            </div>
                        </div>
                        <Badge variant="secondary">Owner</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Invite Team Members
                    </CardTitle>
                    <CardDescription>
                        Add new members to collaborate on your agents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium mb-2">Team Invitations Coming Soon</p>
                        <p className="text-sm mb-4">
                            We're working on team collaboration features that will allow you to:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 mb-6">
                            <li>Invite team members via email</li>
                            <li>Set different permission levels</li>
                            <li>Manage access to specific agents</li>
                            <li>Track team activity and usage</li>
                        </ul>
                        <Button disabled variant="outline">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Members (Coming Soon)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                    <CardDescription>
                        Different access levels for team members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Viewer</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• View agents</li>
                                <li>• Read knowledge base</li>
                                <li>• View conversations</li>
                            </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Editor</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• All Viewer permissions</li>
                                <li>• Edit agents</li>
                                <li>• Manage knowledge base</li>
                                <li>• Configure settings</li>
                            </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Admin</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• All Editor permissions</li>
                                <li>• Manage team members</li>
                                <li>• Billing access</li>
                                <li>• Delete agents</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 