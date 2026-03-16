package com.jobsites.crm.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.NominatimResult
import com.jobsites.crm.data.network.NominatimService
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressAutocompleteField(
    value: String,
    onValueChange: (String) -> Unit,
    onSuggestionSelected: (NominatimResult) -> Unit,
    nominatimService: NominatimService,
    countryCode: String = "",
    modifier: Modifier = Modifier
) {
    var suggestions by remember { mutableStateOf(emptyList<NominatimResult>()) }
    var expanded by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var isUserEditing by remember { mutableStateOf(false) }

    // Debounced search: cancels previous coroutine when value or country changes
    LaunchedEffect(value, countryCode) {
        if (!isUserEditing || value.length < 3) {
            suggestions = emptyList()
            expanded = false
            return@LaunchedEffect
        }
        isLoading = true
        delay(500L) // debounce
        val results = nominatimService.search(value, countryCode)
        suggestions = results
        expanded = results.isNotEmpty()
        isLoading = false
    }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { /* controlled by search results */ },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = { newText ->
                isUserEditing = true
                onValueChange(newText)
            },
            label = { Text("Street") },
            singleLine = true,
            trailingIcon = {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(Icons.Outlined.Search, contentDescription = null, modifier = Modifier.size(18.dp))
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(MenuAnchorType.PrimaryEditable)
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = {
                expanded = false
                suggestions = emptyList()
            }
        ) {
            suggestions.forEach { result ->
                DropdownMenuItem(
                    text = {
                        Text(
                            text = result.displayName,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    onClick = {
                        isUserEditing = false
                        expanded = false
                        suggestions = emptyList()
                        onSuggestionSelected(result)
                    }
                )
            }
        }
    }
}
