'use client'

import { RolePermissions } from '@/components/roles/role-permissions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { authFetcher } from '@/lib/auth-fetcher'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Role } from '../users/user-roles'


interface RoleDialogProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleChange: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z
    .string()
    .min(5, { message: 'Description must be at least 5 characters' }),
  isDefault: z.boolean().default(false),
})

export function RoleDialog({
  role,
  open,
  onOpenChange,
  onRoleChange,
}: RoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isDefault: false,
    },
  })

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        isDefault: false,
      })
    }
  }, [role, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (role) {
        // Update existing role
        await authFetcher.put(`/admin/update-role/${role.id}`, values)
        toast.success('Role updated successfully.')
      } else {
        // Create new role
        await authFetcher.post('/admin/create-role', values)
        toast.success('Role created successfully.')
      }

      onRoleChange()
    } catch (error) {
      console.error('Failed to save role:', error)
      toast.error(role ? 'Failed to update role.' : 'Failed to create role.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {role
              ? 'Update role details and manage permissions.'
              : 'Create a new role with specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={role ? 'permissions' : 'details'}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='details'>Role Details</TabsTrigger>
            <TabsTrigger value='permissions' disabled={!role}>
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-4 pt-4'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter role name'
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter role description'
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isDefault'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Default Role</FormLabel>
                        <p className='text-sm text-muted-foreground'>
                          Default roles cannot be deleted and are assigned
                          automatically.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        {role ? 'Updating...' : 'Creating...'}
                      </>
                    ) : role ? (
                      'Update Role'
                    ) : (
                      'Create Role'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value='permissions' className='pt-4'>
            {role && <RolePermissions roleId={role.id} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
