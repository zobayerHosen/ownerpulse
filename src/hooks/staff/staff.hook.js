import { axiosPrivate } from "@/lib/axios.private";
import { staffService } from "@/services/staff";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Staff Dashboard 
export const useGetStaff = (params) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["staff", params],
        queryFn: () => staffService.getStaff(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    return { data, isLoading, isFetching, isError, error };
};

// ─── PTO staff list
export const useGetPtoStaff = (params = { per_page: 1000 }) => {
    const axiosInstance = axiosPrivate();

    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["pto-staff", params],
        queryFn: () => staffService.getPtoStaff(axiosInstance, params),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const staffList = data?.staff_list?.data ?? (Array.isArray(data?.staff_list) ? data.staff_list : []);

    return { data, staffList, isLoading, isFetching, isError, error };
};

// Note: Director add PTO request
export const useAddPto = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();
    const {
        mutateAsync: addPto,
        isPending,
        isError,
        error
    } = useMutation({
        mutationKey: ["add-pto"],
        mutationFn: (body) => staffService.addPto(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pto-staff"] });
            toast.success(data.message ?? "PTO added successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add PTO")
        },
    });

    return {
        addPto,
        isPending,
        isError,
        error
    };
};

// Note: Director Substitutes get list
export const useGetSubstitutes = (params) => {
    const { data, isError, isLoading, isFetching, error } = useQuery({
        queryKey: ["substitutes", params],
        queryFn: ({ queryKey }) => {
            const [, qParams] = queryKey;
            const axiosInstance = axiosPrivate();
            return staffService.getSubstitutes(axiosInstance, qParams);
        },
        staleTime: 5 * 60 * 1000,
    });

    return { data, isLoading, isFetching, isError, error };
};

// Note: Director add substitute entry request
export const useAddSubstitution = () => {
    const queryClient = useQueryClient();
    const axiosInstance = axiosPrivate();

    const {
        mutateAsync: addSubstitution,
        isPending,
        isError,
        error
    } = useMutation({
        mutationKey: ["add-substitution"],
        mutationFn: (body) => staffService.addSubstitution(axiosInstance, body),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["substitutes"] });
            toast.success(data.message ?? "Substitution added successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message ?? "Failed to add substitution")
        },
    });

    return {
        addSubstitution,
        isPending,
        isError,
        error
    };
};