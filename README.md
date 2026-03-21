# devcontainer.live

![devcontainer.live](public/logo.png)

Source code for https://devcontainer.live

## Build and Run Locally

### Prerequisites
- [Bun](https://bun.sh/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/drehelis/devcontainer.live
cd devcontainer.live
```

2. Install dependencies:
```bash
bun install
```

### Development

Run the development server:
```bash
# pull from the official Dev Container Index and Microsoft Container Registry (requires `skopeo`, `curl` and `jq`)
./scripts/update-data.sh

bun run dev
```

The app will be available at `http://localhost:5173`

## License

This project is licensed under the MIT License.