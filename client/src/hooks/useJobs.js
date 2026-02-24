import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJobs, createJob, updateJob, deleteJob , getJob} from '../services/jobService'
import toast from 'react-hot-toast'
import api from '../services/api'


export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters)
  })
}


export const useCreateJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job added!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add job')
    }
  })
}

export const useUpdateJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update job')
    }
  })
}

export const useDeleteJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted')
    },
    onError: () => {
      toast.error('Failed to delete job')
    }
  })
}





export const useJob = (id) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    enabled: !!id
  })
}

export const useAddInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, data }) => api.post(`/jobs/${jobId}/interviews`, data).then(r => r.data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Interview added!')
    },
    onError: () => toast.error('Failed to add interview')
  })
}

export const useDeleteInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, interviewId }) =>
      api.delete(`/jobs/${jobId}/interviews/${interviewId}`).then(r => r.data),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Interview removed')
    },
    onError: () => toast.error('Failed to delete interview')
  })
}