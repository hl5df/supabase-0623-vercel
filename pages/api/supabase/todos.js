import { createServerSupabaseClient } from "../../../lib/supabase-server";

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ todos: data });
  }

  if (req.method === "POST") {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({ title })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ todo: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID required" });
    }

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ message: "Deleted" });
  }

  if (req.method === "PATCH") {
    const { id, completed } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID required" });
    }

    const { data, error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ todo: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
