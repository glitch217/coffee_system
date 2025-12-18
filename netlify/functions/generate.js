const { Client } = require('@notionhq/client');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { 
      corePurpose, 
      maxMinutes, 
      constraint, 
      vesselImportance, 
      adjustmentTrigger,
      systemName 
    } = body;

    // Validate required fields
    if (!corePurpose || !systemName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_TOKEN,
    });

    // Determine system type based on core purpose
    const systemType = ['Agency', 'Grounding', 'Craft'].includes(corePurpose) 
      ? 'Ritual' 
      : 'Utility';

    // Create the protocol steps based on answers
    const protocolSteps = generateProtocolSteps(corePurpose, maxMinutes, constraint, systemType);

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        'System Name': {
          title: [
            {
              text: {
                content: systemName
              }
            }
          ]
        },
        'System Type': {
          select: {
            name: systemType
          }
        },
        'Core Purpose': {
          select: {
            name: corePurpose
          }
        },
        'Max Minutes': {
          number: parseInt(maxMinutes)
        },
        'Vessel Importance': {
          select: {
            name: vesselImportance
          }
        },
        'Adjustment Trigger': {
          select: {
            name: adjustmentTrigger
          }
        },
        'Status': {
          select: {
            name: 'Active'
          }
        }
      },
      children: createPageContent(systemName, corePurpose, protocolSteps, adjustmentTrigger)
    });

    // Return success with the Notion page URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        pageUrl: response.url,
        pageId: response.id,
        systemName: systemName
      })
    };

  } catch (error) {
    console.error('Error creating Notion page:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create system',
        details: error.message 
      })
    };
  }
};

// Helper function to generate protocol steps
function generateProtocolSteps(corePurpose, maxMinutes, constraint, systemType) {
  const steps = [];
  
  // Step 1 based on core purpose
  switch(corePurpose) {
    case 'Agency':
      steps.push('Choose your beans deliberately (this choice sets the tone)');
      break;
    case 'Grounding':
      steps.push('Take 3 deep breaths before touching anything');
      break;
    case 'Craft':
      steps.push('Measure beans with precision (weigh if possible)');
      break;
    case 'Alertness':
      steps.push('Use a darker roast for maximum caffeine');
      break;
    case 'Steady Energy':
      steps.push('Grind coarser than usual for smoother extraction');
      break;
    case 'Appetite Control':
      steps.push('Add a pinch of cinnamon to grounds before brewing');
      break;
    default:
      steps.push('Prepare your brewing equipment');
  }

  // Step 2 based on time constraint
  if (maxMinutes <= 2) {
    steps.push('Use pre-ground beans or a single-serve system');
  } else if (maxMinutes <= 5) {
    steps.push('Grind fresh beans using an efficient grinder');
  } else {
    steps.push('Take time with each step—this is your ritual');
  }

  // Step 3 based on vessel importance
  steps.push('Pour into your chosen vessel mindfully');

  // Step 4 based on system type
  if (systemType === 'Ritual') {
    steps.push('Hold the warm cup for 30 seconds before first sip');
  } else {
    steps.push('Begin your day while enjoying');
  }

  return steps;
}

// Helper function to create Notion page content
function createPageContent(systemName, corePurpose, steps, adjustmentTrigger) {
  const blocks = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: systemName } }],
        color: 'brown'
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { 
            type: 'text', 
            text: { content: `Optimized for: ` },
            annotations: { bold: true }
          },
          { 
            type: 'text', 
            text: { content: corePurpose },
            annotations: { color: 'brown', bold: true }
          }
        ]
      }
    },
    {
      object: 'block',
      type: 'divider',
      divider: {}
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '☕ Your Protocol' } }],
        color: 'brown'
      }
    }
  ];

  // Add each step as a to-do item
  steps.forEach((step, index) => {
    blocks.push({
      object: 'block',
      type: 'to_do',
      to_do: {
        rich_text: [{ type: 'text', text: { content: step } }],
        checked: false,
        color: 'brown'
      }
    });
  });

  // Add maintenance section
  blocks.push(
    {
      object: 'block',
      type: 'divider',
      divider: {}
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '🔄 Maintenance' } }],
        color: 'gray'
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { 
            type: 'text', 
            text: { content: 'Adjust this system when: ' },
            annotations: { bold: true }
          },
          { 
            type: 'text', 
            text: { content: adjustmentTrigger },
            annotations: { italic: true }
          }
        ]
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { 
            type: 'text', 
            text: { content: 'Generated by Coffee System Generator' },
            annotations: { color: 'gray', italic: true }
          }
        ]
      }
    }
  );

  return blocks;
}