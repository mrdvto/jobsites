package com.jobsites.crm.ui.screens.shared

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.MyLocation
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.jobsites.crm.data.model.ALL_COUNTRIES
import com.jobsites.crm.data.model.LookupOption
import com.jobsites.crm.data.model.User
import com.jobsites.crm.data.model.countryNameByCode
import com.jobsites.crm.ui.components.DatePickerField
import com.jobsites.crm.data.network.NominatimService
import com.jobsites.crm.ui.components.AddressAutocompleteField
import com.jobsites.crm.ui.components.DropdownField
import com.jobsites.crm.ui.components.DropdownOption
import com.jobsites.crm.ui.components.SearchableMultiSelectField

/**
 * Shared mutable state for the project form, used by both Create and Edit.
 */
data class ProjectFormState(
    val name: String = "",
    val description: String = "",
    val statusId: String = "Active",
    val assigneeIds: List<String> = emptyList(),
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    // TODO: In production, default country should come from back-end configuration
    val country: String = "us",
    val valuation: String = "",
    val ownershipTypeId: String = "",
    val primaryStageId: String = "",
    val primaryProjectTypeId: String = "",
    val bidDate: String? = null,
    val targetStartDate: String? = null,
    val targetCompletionDate: String? = null,
    val useCoordinates: Boolean = false,
    val latitude: String = "",
    val longitude: String = "",
)

data class FormValidationError(val message: String)

fun validateProjectForm(form: ProjectFormState, requireName: Boolean = true): FormValidationError? {
    if (requireName && form.name.isBlank()) return FormValidationError("Please enter a project name.")
    if (form.assigneeIds.isEmpty()) return FormValidationError("Please select at least one assignee.")
    return null
}

/**
 * Reusable form fields composable shared by Create and Edit screens.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectFormFields(
    form: ProjectFormState,
    onFormChange: (ProjectFormState) -> Unit,
    users: List<User>,
    primaryStages: List<LookupOption>,
    primaryProjectTypes: List<LookupOption>,
    ownershipTypes: List<LookupOption>,
    nominatimService: NominatimService,
    searchUsers: suspend (String) -> List<DropdownOption>,
    showNameField: Boolean = true,
    showStatusField: Boolean = true,
    modifier: Modifier = Modifier
) {
    val statusOptions = listOf(
        DropdownOption("Active", "Active"),
        DropdownOption("Planning", "Planning"),
        DropdownOption("On Hold", "On Hold"),
        DropdownOption("Completed", "Completed"),
    )
    val stageOptions = listOf(DropdownOption("", "None")) +
            primaryStages.map { DropdownOption(it.id, it.label) }
    val typeOptions = listOf(DropdownOption("", "None")) +
            primaryProjectTypes.map { DropdownOption(it.id, it.label) }
    val ownerOptions = listOf(DropdownOption("", "None")) +
            ownershipTypes.map { DropdownOption(it.id, it.label) }

    Column(modifier = modifier) {
        // ── Basic Information ────────────────────────────────────────
        SectionHeader("Basic Information")

        if (showNameField) {
            OutlinedTextField(
                value = form.name,
                onValueChange = { onFormChange(form.copy(name = it)) },
                label = { Text("Project Name *") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
        }

        if (showStatusField) {
            DropdownField(
                label = "Status",
                options = statusOptions,
                selectedKey = form.statusId,
                onSelect = { onFormChange(form.copy(statusId = it)) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
        }

        val selectedLabels = remember(form.assigneeIds, users) {
            form.assigneeIds.associateWith { key ->
                users.find { it.id.toString() == key }
                    ?.let { "${it.lastName}, ${it.firstName}" } ?: key
            }
        }
        SearchableMultiSelectField(
            label = "Assignee(s) *",
            selectedKeys = form.assigneeIds,
            selectedLabels = selectedLabels,
            onSelectionChange = { onFormChange(form.copy(assigneeIds = it)) },
            onSearch = searchUsers,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Location ────────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Location",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Coordinates",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.width(4.dp))
                Switch(
                    checked = form.useCoordinates,
                    onCheckedChange = { onFormChange(form.copy(useCoordinates = it)) }
                )
            }
        }

        if (form.useCoordinates) {
            // GPS coordinate fields
            val context = LocalContext.current
            val permissionLauncher = rememberLauncherForActivityResult(
                ActivityResultContracts.RequestMultiplePermissions()
            ) { permissions ->
                val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                        permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
                if (granted) {
                    fillLocationFromGps(context)?.let { (lat, lng) ->
                        onFormChange(form.copy(latitude = lat, longitude = lng))
                    }
                }
            }

            OutlinedButton(
                onClick = {
                    val hasPerm = ContextCompat.checkSelfPermission(
                        context, Manifest.permission.ACCESS_FINE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED
                    if (hasPerm) {
                        fillLocationFromGps(context)?.let { (lat, lng) ->
                            onFormChange(form.copy(latitude = lat, longitude = lng))
                        }
                    } else {
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    Icons.Outlined.MyLocation, null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(6.dp))
                Text("Use Current Location")
            }
            Spacer(Modifier.height(8.dp))

            Row(Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = form.latitude,
                    onValueChange = { onFormChange(form.copy(latitude = it)) },
                    label = { Text("Latitude") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(
                    value = form.longitude,
                    onValueChange = { onFormChange(form.copy(longitude = it)) },
                    label = { Text("Longitude") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f)
                )
            }
        } else {
            // Address fields (with autocomplete lookup)

            // TODO: In production, default country should come from back-end configuration
            SearchableCountryDropdown(
                selectedCode = form.country,
                onCountrySelected = { onFormChange(form.copy(country = it)) },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))

            AddressAutocompleteField(
                value = form.street,
                onValueChange = { onFormChange(form.copy(street = it)) },
                onSuggestionSelected = { result ->
                    onFormChange(form.copy(
                        street = result.streetLine(),
                        city = result.cityName(),
                        state = result.address?.state ?: "",
                        zipCode = result.address?.postcode ?: "",
                        country = result.address?.countryCode?.lowercase() ?: form.country,
                        latitude = result.lat,
                        longitude = result.lon
                    ))
                },
                nominatimService = nominatimService,
                countryCode = form.country,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = form.city,
                    onValueChange = { onFormChange(form.copy(city = it)) },
                    label = { Text("City") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(8.dp))
                OutlinedTextField(
                    value = form.state,
                    onValueChange = { onFormChange(form.copy(state = it)) },
                    label = { Text("State") },
                    singleLine = true,
                    modifier = Modifier.weight(0.5f)
                )
            }
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = form.zipCode,
                onValueChange = { onFormChange(form.copy(zipCode = it)) },
                label = { Text("Zip / Postal Code") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }

        Spacer(Modifier.height(16.dp))

        // ── Description ─────────────────────────────────────────────
        SectionHeader("Description")

        OutlinedTextField(
            value = form.description,
            onValueChange = { onFormChange(form.copy(description = it)) },
            label = { Text("Description") },
            minLines = 3,
            maxLines = 5,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Project Details ─────────────────────────────────────────
        SectionHeader("Project Details")

        OutlinedTextField(
            value = form.valuation,
            onValueChange = { onFormChange(form.copy(valuation = it)) },
            label = { Text("Valuation (\$)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Ownership Type",
            options = ownerOptions,
            selectedKey = form.ownershipTypeId,
            onSelect = { onFormChange(form.copy(ownershipTypeId = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Primary Stage",
            options = stageOptions,
            selectedKey = form.primaryStageId,
            onSelect = { onFormChange(form.copy(primaryStageId = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DropdownField(
            label = "Project Type",
            options = typeOptions,
            selectedKey = form.primaryProjectTypeId,
            onSelect = { onFormChange(form.copy(primaryProjectTypeId = it)) },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // ── Dates ───────────────────────────────────────────────────
        SectionHeader("Dates")

        DatePickerField(
            label = "Bid Date",
            value = form.bidDate,
            onValueChange = { onFormChange(form.copy(bidDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DatePickerField(
            label = "Target Start Date",
            value = form.targetStartDate,
            onValueChange = { onFormChange(form.copy(targetStartDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(8.dp))

        DatePickerField(
            label = "Target Completion Date",
            value = form.targetCompletionDate,
            onValueChange = { onFormChange(form.copy(targetCompletionDate = it)) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Suppress("MissingPermission")
private fun fillLocationFromGps(context: Context): Pair<String, String>? {
    val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
    val location = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
        ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        ?: return null
    return Pair(
        "%.6f".format(location.latitude),
        "%.6f".format(location.longitude)
    )
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.fillMaxWidth()
    )
    Spacer(Modifier.height(8.dp))
}

/**
 * Searchable country dropdown that displays full country names but stores ISO codes.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SearchableCountryDropdown(
    selectedCode: String,
    onCountrySelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    var searchText by remember { mutableStateOf("") }
    val displayName = countryNameByCode(selectedCode)

    // When not expanded, show full country name; when expanded, show search text
    val textFieldValue = if (expanded) searchText else displayName

    val filteredCountries = remember(searchText) {
        if (searchText.isBlank()) ALL_COUNTRIES
        else ALL_COUNTRIES.filter { it.name.contains(searchText, ignoreCase = true) }
    }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = {
            expanded = it
            if (it) searchText = "" // clear search when opening
        },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = textFieldValue,
            onValueChange = { searchText = it },
            label = { Text("Country") },
            singleLine = true,
            leadingIcon = {
                Icon(Icons.Outlined.LocationOn, contentDescription = null, modifier = Modifier.size(18.dp))
            },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(MenuAnchorType.PrimaryEditable)
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = {
                expanded = false
                searchText = ""
            }
        ) {
            filteredCountries.forEach { country ->
                DropdownMenuItem(
                    text = { Text(country.name) },
                    onClick = {
                        onCountrySelected(country.code)
                        expanded = false
                        searchText = ""
                    }
                )
            }
            if (filteredCountries.isEmpty()) {
                DropdownMenuItem(
                    text = { Text("No countries found", color = MaterialTheme.colorScheme.onSurfaceVariant) },
                    onClick = { },
                    enabled = false
                )
            }
        }
    }
}
