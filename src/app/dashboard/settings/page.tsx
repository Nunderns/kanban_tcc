"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

type Section = 'profile' | 'preferences' | 'notifications' | 'security' | 'activity' | 'connections' | 'developer';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const email = session?.user?.email || "";
  
  const getInitials = (value?: string | null) => {
    if (!value) return "UN";
    const parts = value.trim().split(/\s+/);
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    const at = value.indexOf("@");
    if (at > 0) return `${value[0]}${value[at + 1] || "N"}`.toUpperCase();
    return value.slice(0, 2).toUpperCase();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border border-gray-200">
                    <AvatarImage src={session?.user?.image ?? undefined} alt={name} />
                    <AvatarFallback>{getInitials(name || email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-medium">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      id="firstName"
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                      defaultValue={name.split(" ")[0] || ""}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                      defaultValue={name.split(" ").slice(1).join(" ") || ""}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 bg-gray-50"
                      defaultValue={email}
                      disabled
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button>Save changes</Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Deactivate account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Theme</h3>
                  <p className="text-sm text-gray-600 mb-3">Select your preferred theme.</p>
                  <select className="w-full rounded-md border border-gray-200 px-3 py-2">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium mb-2">First day of the week</h3>
                  <p className="text-sm text-gray-600 mb-3">This will change how all calendars in your app look.</p>
                  <select className="w-full rounded-md border border-gray-200 px-3 py-2">
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Smooth Cursor</h3>
                    <p className="text-sm text-gray-600">Enable smooth cursor animation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</CardTitle>
              <CardDescription>This section is under development.</CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  const sections: { id: Section; name: string }[] = [
    { id: 'profile', name: 'Profile' },
    { id: 'preferences', name: 'Preferences' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'security', name: 'Security' },
    { id: 'activity', name: 'Activity' },
    { id: 'connections', name: 'Connections' },
    { id: 'developer', name: 'Developer' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === section.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {sections.find(s => s.id === activeSection)?.name}
            </h1>
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
