import { apiRequest } from "../../../helpers/apiHelper";

const lostFoundApi = {
  // params: { status: "lost" | "found", is_completed: 1 | 0, is_me: 1 }
  getAll: async (params = {}) => {
    const json = await apiRequest("/lost-founds", { params });
    return json.data?.lost_founds ?? [];
  },

  getById: async (id) => {
    const json = await apiRequest(`/lost-founds/${id}`);
    return json.data?.lost_found ?? null;
  },

  add: async ({ title, description, status }) => {
    const json = await apiRequest("/lost-founds", {
      method: "POST",
      body: { title, description, status },
    });
    return json.data;
  },

  change: async (id, { title, description, status, is_completed }) => {
    const json = await apiRequest(`/lost-founds/${id}`, {
      method: "PUT",
      body: { title, description, status, is_completed },
    });
    return json.data;
  },

  changeCover: async (id, file) => {
    const body = new FormData();
    body.append("cover", file);
    const json = await apiRequest(`/lost-founds/${id}/cover`, {
      method: "POST",
      body,
    });
    return json.data;
  },

  remove: async (id) => {
    const json = await apiRequest(`/lost-founds/${id}`, { method: "DELETE" });
    return json.data;
  },

  // type: "daily" | "monthly"
  getStats: async (type = "daily", params = {}) => {
    const json = await apiRequest(`/lost-founds/stats/${type}`, { params });
    return json.data;
  },
};

export default lostFoundApi;
