import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Tag,
  Lightbulb,
  Image,
  DollarSign,
  BarChart,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would validate credentials
    if (loginData.username && loginData.password) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-rose-900 text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  placeholder="Enter password"
                />
              </div>
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-tangerine text-6xl text-rose-900">Admin Dashboard</h1>
          <Button
            onClick={() => setIsLoggedIn(false)}
            variant="outline"
            className="border-rose-500 text-rose-500 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total Services</CardTitle>
              <Package className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-rose-900">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Active Offers</CardTitle>
              <Tag className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-rose-900">6</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Beauty Tips</CardTitle>
              <Lightbulb className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-rose-900">6</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Images</CardTitle>
              <Image className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-rose-900">24</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="prices">Prices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-rose-900">Manage Services</CardTitle>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    'Hair Treatments',
                    'Hair Extensions',
                    'Color & Highlights',
                    'Nail Services',
                  ].map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-rose-50 rounded-lg"
                    >
                      <span className="text-gray-800">{service}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-500">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-rose-900">Manage Offers</CardTitle>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <Input placeholder="Offer Title" className="mb-4" />
                    <Textarea placeholder="Offer Description" className="mb-4" />
                    <Input placeholder="Valid Until" type="date" className="mb-4" />
                    <Input placeholder="Discount %" type="number" className="mb-4" />
                    <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                      Save Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-rose-900">Manage Beauty Tips</CardTitle>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tip
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <Input placeholder="Tip Title" className="mb-4" />
                  <Textarea placeholder="Tip Description" className="mb-4" />
                  <Textarea placeholder="Detailed Tips (one per line)" className="mb-4" />
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Save Tip</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle className="text-rose-900">Manage Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Drag and drop images here or click to browse</p>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prices Tab */}
          <TabsContent value="prices">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-rose-900">Manage Prices</CardTitle>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Update Prices
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-rose-50 rounded-lg">
                    <Input placeholder="Service Name" />
                    <Input placeholder="Min Price (AED)" type="number" />
                    <Input placeholder="Max Price (AED)" type="number" />
                  </div>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white w-full">
                    Add Price Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-rose-900">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload weekly checklist and analytics data</p>
                    <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Analytics
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-600">This Week</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-rose-900">45 Appointments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-600">This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-rose-900">182 Appointments</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-600">Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-rose-900">AED 45,600</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
