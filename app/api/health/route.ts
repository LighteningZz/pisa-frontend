import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health check
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
