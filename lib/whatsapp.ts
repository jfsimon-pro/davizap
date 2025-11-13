import axios from 'axios';

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v19.0';
const BASE_URL = `${process.env.WHATSAPP_GRAPH_API_URL}/${API_VERSION}`;

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
}

export async function sendMessage(
  config: WhatsAppConfig,
  phoneNumber: string,
  message: string
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber.replace(/\D/g, ''),
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function sendTemplate(
  config: WhatsAppConfig,
  phoneNumber: string,
  templateName: string,
  language: string,
  parameters?: string[]
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          ...(parameters && {
            components: [
              {
                type: 'body',
                parameters: parameters.map((param) => ({ type: 'text', text: param })),
              },
            ],
          }),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp template:', error);
    throw error;
  }
}

export async function markMessageAsRead(
  config: WhatsAppConfig,
  messageId: string
) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}
