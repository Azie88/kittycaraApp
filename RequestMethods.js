import axios from 'axios';

export const huggingface_url = axios.create({
  baseURL: 'https://bambadij-apikittycara.hf.space',
  timeout: 60000,
});
