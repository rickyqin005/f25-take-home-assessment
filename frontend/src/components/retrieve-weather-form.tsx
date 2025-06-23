"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RetrieveWeatherFormData {
  weather_id: string;
}

export function RetrieveWeatherForm() {
  const [formData, setFormData] = useState<RetrieveWeatherFormData>({
    weather_id: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: object;
    errorMessage?: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${formData.weather_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          data: data,
        });
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          errorMessage: errorData.detail || "Failed to retrieve weather request",
        });
      }
    } catch {
      setResult({
        success: false,
        errorMessage: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Retrieval</CardTitle>
        <CardDescription>
          Enter your weather request ID to retrieve your request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weather_id">Weather Request ID</Label>
            <Input
              id="weather_id"
              name="weather_id"
              type="text"
              placeholder="Enter your provided ID"
              value={formData.weather_id}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Retrieving..." : "Retrieve Weather Request"}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-md ${
                !result.success
                  ? "bg-red-900/20 text-red-500 border border-red-500"
                  : "bg-900/20 text-500 border"
              }`}
            >
              { result.success
              ? <>
                <p className="text-xl">{`${result.data.location.name}, ${result.data.location.country}`}</p>
                <p>{`${new Date(result.data.location.localtime).toLocaleString()} (local time)`}</p>
                <div className="flex flex-row items-center pt-2 pb-4">
                  <img src={result.data.current.weather_icons[0]}></img>
                  <div className="text-4xl px-4">{`${result.data.current.temperature}`}
                    <span className="text-sm align-top">°C</span>
                  </div>
                  <div className="inline">
                    <div className="text-lg">{result.data.current.weather_descriptions[0]}</div>
                    <div>{`Feels like ${result.data.current.feelslike}`}
                      <span className="text-[9px] align-top">°C</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-x-8 pb-5">
                  <div>{`Humidity: ${result.data.current.humidity}%`}</div>
                  <div>{`Pressure: ${result.data.current.pressure} `}
                    <span className="text-sm">hPa</span>
                  </div>
                  <div>{`Wind: ${result.data.current.wind_speed} `}
                    <span className="text-sm">km/h from</span>{` ${result.data.current.wind_dir}`}</div>
                  <div>{`UV: ${result.data.current.uv_index}`}</div>
                  <div>{`Cloud cover: ${result.data.current.cloudcover}%`}</div>
                  <div>{`Visibility: ${result.data.current.visibility} `}
                    <span className="text-sm">km</span>
                  </div>
                </div>
                <div className="pb-5">
                  <div>Astronomy</div>
                  <div className="grid grid-cols-2 gap-x-8 text-sm opacity-50">
                    <div>{`Sunrise: ${result.data.current.astro.sunrise}`}</div>
                    <div>{`Sunset: ${result.data.current.astro.sunset}`}</div>
                    <div>{`Moonrise: ${result.data.current.astro.moonrise}`}</div>
                    <div>{`Moonset: ${result.data.current.astro.moonset}`}</div>
                    <div className="col-span-2">{`Phase: ${result.data.current.astro.moon_phase}`}</div>
                  </div>
                </div>
                <div className="pb-5">
                  <div>Air Quality</div>
                  <div className="grid grid-cols-3 gap-x-4 text-sm opacity-50">
                    <div>{`PM₂.₅: ${result.data.current.air_quality.pm2_5}`}</div>
                    <div>{`PM₁₀: ${result.data.current.air_quality.pm10}`}</div>
                    <div>{`CO: ${result.data.current.air_quality.co}`}</div>
                    <div>{`NO₂: ${result.data.current.air_quality.no2}`}</div>
                    <div>{`O₃: ${result.data.current.air_quality.o3}`}</div>
                    <div>{`SO₂: ${result.data.current.air_quality.so2}`}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-sm opacity-50">
                    <div>{`GB Defra Index: ${result.data.current.air_quality["gb-defra-index"]}`}</div>
                    <div>{`US EPA Index: ${result.data.current.air_quality["us-epa-index"]}`}</div>
                  </div>
                </div>
                <div>
                  <div>Notes</div>
                  <div className="opacity-50">{result.data.user_data.notes}</div>
                </div>
              </>
              : <p className="text-sm font-medium">{result.errorMessage}</p> }
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
