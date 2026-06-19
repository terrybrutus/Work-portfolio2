import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useListProjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["portfolio", "projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProject(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["portfolio", "project", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProject(BigInt(id));
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useResume() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["resume"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getResume();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedPortfolio() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedPortfolio();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

export function useSeedResume() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedResume();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    },
  });
}
