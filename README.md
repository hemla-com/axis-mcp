# @hemla/axis-mcp

[![CI](https://github.com/hemla-com/axis-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/hemla-com/axis-mcp/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

MCP server for configuring [Axis](https://www.axis.com) IP cameras via [VAPIX](https://developer.axis.com/vapix/).

## Installation

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "Axis": {
      "command": "npx",
      "args": ["-y", "@hemla/axis-mcp@0.1.0"]
    }
  }
}
```

## Usage

Connect to a camera first, then use any tool:

```
Connect to my Axis camera at 192.168.1.100 with user admin and password secret
```

```
Show me the camera's device info
```

```
Take a snapshot
```

## Tools

### Connection
| Tool | Description |
|------|-------------|
| `connect_camera` | Connect to an Axis camera via VAPIX |

### Device Information
| Tool | Description |
|------|-------------|
| `get_device_info` | Get device properties (model, serial, firmware) |
| `discover_apis` | Discover all VAPIX APIs supported by the camera |
| `get_capture_mode` | Get available capture modes (resolution/FPS) |

### Snapshot
| Tool | Description |
|------|-------------|
| `get_snapshot` | Capture a JPEG snapshot |

### Image Settings
| Tool | Description |
|------|-------------|
| `get_image_settings` | Get sensor settings (brightness, contrast, etc.) |
| `set_image_settings` | Update sensor settings |

### Overlay
| Tool | Description |
|------|-------------|
| `get_overlay` | Get text and image overlays |
| `add_text_overlay` | Add a text overlay to the video stream |
| `remove_overlay` | Remove an overlay by identity |

### Date, Time & NTP
| Tool | Description |
|------|-------------|
| `get_datetime` | Get current date, time, timezone |
| `set_datetime` | Set date, time, or timezone |
| `get_ntp` | Get NTP configuration |
| `set_ntp` | Configure NTP synchronization |

### Network
| Tool | Description |
|------|-------------|
| `get_network_info` | Get network parameters (IP, DNS, hostname) |
| `get_network_config` | Get network config via modern API |
| `set_network_config` | Update network settings |

### Stream Profiles
| Tool | Description |
|------|-------------|
| `get_stream_profiles` | List all stream profiles |
| `create_stream_profile` | Create a new stream profile |
| `update_stream_profile` | Update an existing stream profile |
| `remove_stream_profile` | Remove a stream profile |

### PTZ (Pan/Tilt/Zoom)
| Tool | Description |
|------|-------------|
| `get_ptz_position` | Get current PTZ position |
| `set_ptz_position` | Set absolute PTZ position |
| `ptz_move` | Send relative move command |
| `get_ptz_presets` | List PTZ preset positions |
| `goto_ptz_preset` | Move to a named preset |

### System
| Tool | Description |
|------|-------------|
| `reboot_camera` | Reboot the camera |
| `get_system_log` | Get system log |
| `get_access_log` | Get client access log |
| `get_server_report` | Get detailed server report |
| `factory_default` | Reset to factory defaults |

### Users & Storage
| Tool | Description |
|------|-------------|
| `get_users` | Get user accounts and groups |
| `create_user` | Create a new user account |
| `update_user` | Update a user's password or role |
| `remove_user` | Remove a user account |
| `setup_initial_user` | Set up the first admin user on a factory-fresh camera (no auth required) |
| `get_storage_info` | Get storage/SD card information |

## Development

```bash
git clone https://github.com/hemla-com/axis-mcp.git
cd axis-mcp
npm install
npm run dev
```

## License

[GPL-3.0](LICENSE) -- Hemla
