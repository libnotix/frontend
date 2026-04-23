"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { LoginStartRequest, LoginEndRequest, RegisterRequest } from "../api";

export const useLoginStart = () => {
  return useMutation({
    mutationFn: (data: LoginStartRequest) => {
      return api.authLoginStartPost({ loginStartRequest: data });
    },
  });
};

export const useLoginEnd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginEndRequest) => {
       return api.authLoginEndPost({ loginEndRequest: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api.authSessionGet(),
    retry: false,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => {
      return api.authRegisterPost({ registerRequest: data });
    },
  });
};
