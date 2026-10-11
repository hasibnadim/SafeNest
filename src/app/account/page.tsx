'use client';
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, Edit2Icon, Edit3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const editSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(['male', 'female', 'other']).or(z.literal('')),
  });

type EditFormValues = z.infer<typeof editSchema>;

export default function ProfileViewEdit() {
  const [isEditing, setIsEditing] = useState(false);
  const { user: sUser } = useAuth();
  const [user, setUser] = useState(sUser!);

  const form = useForm<EditFormValues>({
    //  @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      address: user.address ?? '',
      city: user.city ?? '',
      country: user.country ?? '',
      dateOfBirth: user.dateOfBirth ?? '',
      gender: (user.gender as 'male' | 'female' | 'other' | undefined) ?? '',
    },
  });

  const onSubmit = async (data: EditFormValues) => {
    try {
      const response = await fetch('/auth/api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save the update.');
      }

      setUser((currentUser) => ({ ...currentUser, ...data }));
      setIsEditing(false);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to save the update.');
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-1 md:p-5">
      <div className="flex justify-end items-center mb-1">
        <Button variant={'ghost'} onClick={() => setIsEditing(p => !p)} className='cursor-pointer'>
          {isEditing ? <Edit3 /> : <Edit2Icon />}
        </Button>
      </div>
      <Card className="shadow-lg mb-8">
        <CardContent>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">{user.email}</span>
            </div>
          </div>

        </CardContent>
      </Card>
      {isEditing ? <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input value={user.email} disabled className="bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-gray-100" />
            </FormControl>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </FormItem>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-linear-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Form> :

        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-slate-900 dark:text-gray-100">{user.phone || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                <p className="font-medium text-slate-900 dark:text-gray-100">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-slate-900 dark:text-gray-100">{(user.city || user.country) ? `${user.city || ''}${user.city && user.country ? ', ' : ''}${user.country || ''}` : '—'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.address || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                <p className="font-medium capitalize text-slate-900 dark:text-gray-100">{user.gender || '—'}</p>
              </div>
            </div>

          </div>




        </>}
    </div >

  );
}