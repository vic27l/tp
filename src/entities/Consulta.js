import { supabase } from '../lib/supabase';

export class Consulta {
  static async list(orderBy = 'created_at') {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: !orderBy.startsWith('-') });
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        created_date: item.created_at,
        updated_date: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching consultas:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from('consultas')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...result,
        created_date: result.created_at,
        updated_date: result.updated_at
      };
    } catch (error) {
      console.error('Error creating consulta:', error);
      throw error;
    }
  }

  static async bulkCreate(dataArray) {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .insert(dataArray)
        .select();
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        created_date: item.created_at,
        updated_date: item.updated_at
      }));
    } catch (error) {
      console.error('Error bulk creating consultas:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { data: result, error } = await supabase
        .from('consultas')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...result,
        created_date: result.created_at,
        updated_date: result.updated_at
      };
    } catch (error) {
      console.error('Error updating consulta:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('consultas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting consulta:', error);
      throw error;
    }
  }
}