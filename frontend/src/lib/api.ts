import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export type TenderStatus =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "responding"
  | "submitted"
  | "won"
  | "lost"
  | "ignored";

export interface Tender {
  id: number;
  external_id: string;
  source: string;
  title: string;
  buyer: string | null;
  location: string | null;
  estimated_value: number | null;
  deadline: string | null;
  match_score: number | null;
  status: TenderStatus;
  url: string | null;
}

export const tenders = {
  list: (params?: { status?: string; min_score?: number }) =>
    api.get<Tender[]>("/tenders", { params }).then((r) => r.data),
  get: (id: number) => api.get<Tender>(`/tenders/${id}`).then((r) => r.data),
  updateStatus: (id: number, status: TenderStatus) =>
    api.patch(`/tenders/${id}/status`, { status }),
};

export const profile = {
  get: () => api.get("/profile").then((r) => r.data),
  upsert: (data: unknown) => api.put("/profile", data).then((r) => r.data),
};
