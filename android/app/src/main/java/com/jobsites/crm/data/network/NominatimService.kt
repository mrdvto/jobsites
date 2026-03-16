package com.jobsites.crm.data.network

import com.jobsites.crm.data.model.NominatimResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.URLEncoder

class NominatimService(private val client: OkHttpClient) {

    private val json = Json { ignoreUnknownKeys = true }

    @Volatile
    private var lastRequestTime = 0L

    suspend fun search(query: String, countryCode: String = ""): List<NominatimResult> = withContext(Dispatchers.IO) {
        try {
            // Enforce ≥1000ms between requests (Nominatim usage policy)
            val now = System.currentTimeMillis()
            val elapsed = now - lastRequestTime
            if (elapsed < 1000) {
                kotlinx.coroutines.delay(1000 - elapsed)
            }

            val encoded = URLEncoder.encode(query, "UTF-8")
            val countryParam = if (countryCode.isNotBlank()) "&countrycodes=$countryCode" else ""
            val url = "https://nominatim.openstreetmap.org/search" +
                "?q=$encoded&format=json&addressdetails=1&limit=5$countryParam"

            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "JobsitesCRM-Android/1.0 (prototype)")
                .header("Accept-Language", "en")
                .build()

            lastRequestTime = System.currentTimeMillis()
            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: return@withContext emptyList()
            json.decodeFromString<List<NominatimResult>>(body)
        } catch (_: Exception) {
            emptyList()
        }
    }
}
