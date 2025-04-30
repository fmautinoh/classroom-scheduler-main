"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoursesSettings } from "@/components/settings/courses-settings"
import { TeachersSettings } from "@/components/settings/teachers-settings"
import { ClassroomsSettings } from "@/components/settings/classrooms-settings"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="courses" className="space-y-4">
      <TabsList>
        <TabsTrigger value="courses">Cursos</TabsTrigger>
        <TabsTrigger value="teachers">Docentes</TabsTrigger>
        <TabsTrigger value="classrooms">Aulas</TabsTrigger>
      </TabsList>
      <TabsContent value="courses" className="space-y-4">
        <CoursesSettings />
      </TabsContent>
      <TabsContent value="teachers" className="space-y-4">
        <TeachersSettings />
      </TabsContent>
      <TabsContent value="classrooms" className="space-y-4">
        <ClassroomsSettings />
      </TabsContent>
    </Tabs>
  )
}
