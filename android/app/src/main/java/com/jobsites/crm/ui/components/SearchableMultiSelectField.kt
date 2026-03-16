package com.jobsites.crm.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.InputChip
import androidx.compose.material3.InputChipDefaults
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

/**
 * A searchable multi-select field that simulates an API-backed user search.
 *
 * Typing in the text field triggers a debounced search. Results appear in a dropdown
 * with checkboxes. Selected items display as dismissible chips below the field.
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SearchableMultiSelectField(
    label: String,
    selectedKeys: List<String>,
    selectedLabels: Map<String, String>,
    onSelectionChange: (List<String>) -> Unit,
    onSearch: suspend (query: String) -> List<DropdownOption>,
    modifier: Modifier = Modifier
) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf(emptyList<DropdownOption>()) }
    var expanded by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    // Debounced search
    LaunchedEffect(query) {
        if (query.isBlank()) {
            results = emptyList()
            expanded = false
            return@LaunchedEffect
        }
        isLoading = true
        delay(300L)
        results = onSearch(query)
        expanded = results.isNotEmpty()
        isLoading = false
    }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { /* controlled by search results */ },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text(label) },
            placeholder = { Text("Type to search\u2026") },
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
                results = emptyList()
            }
        ) {
            results.forEach { option ->
                val isSelected = option.key in selectedKeys
                DropdownMenuItem(
                    text = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = isSelected,
                                onCheckedChange = null // handled by row click
                            )
                            Text(
                                text = option.label,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    },
                    onClick = {
                        val newSelection = if (isSelected) {
                            selectedKeys - option.key
                        } else {
                            selectedKeys + option.key
                        }
                        onSelectionChange(newSelection)
                        // Keep dropdown open for additional selections
                    }
                )
            }
        }
    }

    // Selected chips
    if (selectedKeys.isNotEmpty()) {
        FlowRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            selectedKeys.forEach { key ->
                val chipLabel = selectedLabels[key] ?: key
                InputChip(
                    selected = true,
                    onClick = { onSelectionChange(selectedKeys - key) },
                    label = {
                        Text(chipLabel, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    },
                    trailingIcon = {
                        Icon(
                            Icons.Filled.Close,
                            contentDescription = "Remove",
                            modifier = Modifier.size(InputChipDefaults.IconSize)
                        )
                    }
                )
            }
        }
    }
}
