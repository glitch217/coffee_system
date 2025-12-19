const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

exports.handler = async (event) => {
  try {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Method not allowed' })
      };
    }

    // Parse JSON body
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (err) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
      };
    }

    const { mode, answers, systemName, timestamp } = data;

    // Validate request payload
    if (!mode || !answers || typeof answers !== 'object') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields',
          received: { mode, answersType: typeof answers, systemName, timestamp }
        })
      };
    }

    // Validate environment variables
    const hasToken = Boolean(process.env.NOTION_TOKEN);
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!hasToken || !dbId) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Missing Notion environment variables',
          missing: {
            NOTION_TOKEN: hasToken ? false : true,
            NOTION_DATABASE_ID: dbId ? false : true
          }
        })
      };
    }

    // ---- Notion database property names ----
    // IMPORTANT: these must match your Notion DB schema exactly.
    // If your DB uses different property names, Notion will throw a validation error.
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: systemName || 'Coffee System'
            }
          }
        ]
      },
      Mode: {
        select: {
          name: mode
        }
      },
      Created: {
        date: {
          start: timestamp || new Date().toISOString()
        }
      }
    };

    const children = Object.entries(answers).map(([key, value]) => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `${key}: ${String(value)}`
            }
          }
        ]
      }
    }));

    // Create page
    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties,
      children
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        pageUrl: response.url
      })
    };

  } catch (error) {
    // Surface useful Notion error information (without dumping secrets)
    const status = error?.status || 500;
    const code = error?.code || null;

    // Notion SDK typically provides `body` with details
    const notionMessage =
      error?.body?.message ||
      error?.message ||
      'Unknown error';

    const notionDetails =
      error?.body ||
      null;

    console.error('Generate function error:', {
      status,
      code,
      message: notionMessage,
      details: notionDetails
    });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        status,
        code,
        message: notionMessage,
        details: notionDetails
      })
    };
  }
};
