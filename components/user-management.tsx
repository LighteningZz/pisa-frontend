"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, Mail, Phone, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const translations = {
  en: {
    title: "User Management",
    description: "Manage system users and permissions",
    addUser: "Add New User",
    searchUsers: "Search users...",
    filterByRole: "Filter by Role",
    allRoles: "All Roles",
    administrator: "Administrator",
    teacher: "Teacher",
    student: "Student",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    lastLogin: "Last Login",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    edit: "Edit",
    delete: "Delete",
    activate: "Activate",
    deactivate: "Deactivate",
    userDetails: "User Details",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    dateJoined: "Date Joined",
    permissions: "Permissions",
    save: "Save Changes",
    cancel: "Cancel",
    createUser: "Create User",
    totalUsers: "Total Users",
    activeUsers: "Active Users",
    newThisMonth: "New This Month",
  },
  th: {
    title: "จัดการผู้ใช้",
    description: "จัดการผู้ใช้ระบบและสิทธิ์การเข้าถึง",
    addUser: "เพิ่มผู้ใช้ใหม่",
    searchUsers: "ค้นหาผู้ใช้...",
    filterByRole: "กรองตามบทบาท",
    allRoles: "��ุกบทบาท",
    administrator: "ผู้ดูแลระบบ",
    teacher: "ครู",
    student: "นักเรียน",
    name: "ชื่อ",
    email: "อีเมล",
    role: "บทบาท",
    status: "สถานะ",
    lastLogin: "เข้าสู่ระบบล่าสุด",
    actions: "การดำเนินการ",
    active: "ใช้งาน",
    inactive: "ไม่ใช้งาน",
    suspended: "ระงับ",
    edit: "แก้ไข",
    delete: "ลบ",
    activate: "เปิดใช้งาน",
    deactivate: "ปิดใช้งาน",
    userDetails: "รายละเอียดผู้ใช้",
    firstName: "ชื่อ",
    lastName: "นามสกุล",
    phoneNumber: "เบอร์โทรศัพท์",
    dateJoined: "วันที่เข้าร่วม",
    permissions: "สิทธิ์การเข้าถึง",
    save: "บันทึกการเปลี่ยนแปลง",
    cancel: "ยกเลิก",
    createUser: "สร้างผู้ใช้",
    totalUsers: "ผู้ใช้ทั้งหมด",
    activeUsers: "ผู้ใช้ที่ใช้งาน",
    newThisMonth: "ใหม่เดือนนี้",
  },
}

interface UserManagementProps {
  language: "en" | "th"
}

export default function UserManagement({ language }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
    phoneNumber: "",
  })

  const t = translations[language]

  const users = [
    {
      id: "user_001",
      firstName: "สมชาย",
      lastName: "ใจดี",
      email: "somchai@school.ac.th",
      role: "teacher",
      status: "active",
      lastLogin: "2024-01-15 09:30",
      dateJoined: "2023-08-15",
      phoneNumber: "+66 81 234 5678",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user_002",
      firstName: "สมหญิง",
      lastName: "รักเรียน",
      email: "somying@school.ac.th",
      role: "student",
      status: "active",
      lastLogin: "2024-01-15 14:20",
      dateJoined: "2023-09-01",
      phoneNumber: "+66 82 345 6789",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user_003",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@school.ac.th",
      role: "administrator",
      status: "active",
      lastLogin: "2024-01-15 16:45",
      dateJoined: "2023-07-01",
      phoneNumber: "+66 83 456 7890",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user_004",
      firstName: "มาลี",
      lastName: "สวยงาม",
      email: "malee@school.ac.th",
      role: "teacher",
      status: "inactive",
      lastLogin: "2024-01-10 11:15",
      dateJoined: "2023-08-20",
      phoneNumber: "+66 84 567 8901",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "administrator":
        return "bg-red-100 text-red-800"
      case "teacher":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleCreateUser = () => {
    // Create user logic here
    console.log("Creating user:", newUser)
    setIsCreateDialogOpen(false)
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      phoneNumber: "",
    })
  }

  const userStats = [
    { label: t.totalUsers, value: users.length, icon: "👥" },
    { label: t.activeUsers, value: users.filter((u) => u.status === "active").length, icon: "✅" },
    { label: t.newThisMonth, value: 12, icon: "📈" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.createUser}</DialogTitle>
              <DialogDescription>{t.userDetails}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t.role}</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">{t.student}</SelectItem>
                      <SelectItem value="teacher">{t.teacher}</SelectItem>
                      <SelectItem value="administrator">{t.administrator}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phoneNumber}</Label>
                  <Input
                    id="phone"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleCreateUser}>{t.createUser}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t.searchUsers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t.filterByRole} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allRoles}</SelectItem>
                <SelectItem value="administrator">{t.administrator}</SelectItem>
                <SelectItem value="teacher">{t.teacher}</SelectItem>
                <SelectItem value="student">{t.student}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.name}</TableHead>
                <TableHead>{t.email}</TableHead>
                <TableHead>{t.role}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.lastLogin}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{t[user.role as keyof typeof t]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{t[user.status as keyof typeof t]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {user.lastLogin}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        {user.status === "active" ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
