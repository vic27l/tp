import { supabase } from '../lib/supabase';

export class Paciente {
  static async list(orderBy = 'created_at') {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: !orderBy.startsWith('-') });
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        created_date: item.created_at,
        updated_date: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching pacientes:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from('pacientes')
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
      console.error('Error creating paciente:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const { data: result, error } = await supabase
        .from('pacientes')
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
      console.error('Error updating paciente:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting paciente:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        created_date: data.created_at,
        updated_date: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching paciente:', error);
      throw error;
    }
  }
}