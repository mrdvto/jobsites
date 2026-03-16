package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NominatimResult(
    @SerialName("display_name") val displayName: String = "",
    val lat: String = "",
    val lon: String = "",
    val address: NominatimAddress? = null
) {
    /** Build a street string from house number + road */
    fun streetLine(): String = buildString {
        address?.houseNumber?.let { append(it); append(" ") }
        address?.road?.let { append(it) }
    }.trim()

    /** Coalesce city / town / village */
    fun cityName(): String =
        address?.city ?: address?.town ?: address?.village ?: ""
}

@Serializable
data class NominatimAddress(
    val road: String? = null,
    @SerialName("house_number") val houseNumber: String? = null,
    val city: String? = null,
    val town: String? = null,
    val village: String? = null,
    val state: String? = null,
    val postcode: String? = null,
    val country: String? = null,
    @SerialName("country_code") val countryCode: String? = null
)
