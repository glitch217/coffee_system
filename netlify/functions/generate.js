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
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse body safely
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    const { mode, answers, systemName, timestamp } = data;

    // Minimal, correct validation
    if (!mode || !answers || typeof answers !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          received: { mode, answers, systemName, timestamp }
        })
      };
    }

    if (!process.env.NOTION_DATABASE_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Notion database ID not configured' })
      };
    }

    // Build Notion properties
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

    // Add answers as rich text blocks
    const children = Object.entries(answers).map(([key, value]) => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `${key}: ${value}`
            }
          }
        ]
      }
    }));

    // Create page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties,
      children
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        pageUrl: response.url
      })
    };

  } catch (error) {
    console.error('Generate function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};
